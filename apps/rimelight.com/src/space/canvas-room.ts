/**
 * The live room for one Rimelight Space canvas (Space CV.3, decision 0045). A Durable Object: one room per canvas,
 * named by the canvas id (`idFromName(canvasId)`). Sockets use the WebSocket hibernation API, so a room with no
 * traffic costs nothing. While the room is alive it is the authority for the canvas: ops are applied here and
 * fanned out to every socket. Its SQLite storage is a write-ahead copy: every applied item is written there at once
 * (dirty = 1), and the alarm copies dirty items to Postgres at most about 1 s later. The room also flushes when the
 * last socket closes. Postgres stays the durable record; a room that starts cold loads from it.
 *
 * Only the Worker calls this object (canvas-live.ts), on internal paths: /ticket, /connect, /event.
 */
import { DurableObject } from "cloudflare:workers";
import { getSql } from "../db/index.ts";
import {
  type Access,
  type ItemState,
  TICKET_TTL_MS,
  applyOp,
  colorFor,
  newHexId,
  parseClientMessage,
} from "./canvas-room-logic.ts";

type Viewport = { x: number; y: number; zoom: number; w: number; h: number };

/** Per-socket state, kept on the socket so it survives hibernation. */
type Conn = {
  conn_id: string;
  user_id: string;
  name: string;
  color: string;
  access: Access;
  cursor: { x: number; y: number } | null;
  selection: string[];
  viewport: Viewport | null;
};

/** What the Worker stores with a ticket. */
type TicketData = { canvas_id: string; user_id: string; name: string; access: Access };

type SqlRow = Record<string, SqlStorageValue>;

const ACCESS_LEVELS: readonly string[] = ["view", "edit", "manage"];

const str = (row: SqlRow, key: string): string => String(row[key]);
const num = (row: SqlRow, key: string): number => Number(row[key]);

function rowToItem(row: SqlRow): ItemState {
  return {
    id: str(row, "id"),
    kind: str(row, "kind") as ItemState["kind"],
    z: str(row, "z"),
    version: num(row, "version"),
    props: JSON.parse(str(row, "props")) as Record<string, unknown>,
    deleted: num(row, "deleted") !== 0,
    created_by: str(row, "created_by"),
    updated_by: str(row, "updated_by"),
    updated_at: num(row, "updated_at"),
  };
}

function connOf(ws: WebSocket): Conn | null {
  const raw = ws.deserializeAttachment() as Conn | null | undefined;
  return raw ?? null;
}

function peerOf(conn: Conn) {
  return {
    conn_id: conn.conn_id,
    user_id: conn.user_id,
    name: conn.name,
    color: conn.color,
    cursor: conn.cursor,
    selection: conn.selection,
    viewport: conn.viewport,
  };
}

export class CanvasRoom extends DurableObject {
  private items: Map<string, ItemState> | null = null;
  private seq = 0;
  private archived = false;
  private title = "";
  private loading: Promise<void> | null = null;

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    void this.ctx.blockConcurrencyWhile(async () => {
      this.ctx.storage.sql.exec(
        "CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY, value TEXT NOT NULL)",
      );
      this.ctx.storage.sql
        .exec(`CREATE TABLE IF NOT EXISTS items (id TEXT PRIMARY KEY, kind TEXT NOT NULL,
        z TEXT NOT NULL, version INTEGER NOT NULL, props TEXT NOT NULL, deleted INTEGER NOT NULL,
        created_by TEXT NOT NULL, updated_by TEXT NOT NULL, updated_at INTEGER NOT NULL,
        dirty INTEGER NOT NULL DEFAULT 0)`);
      this.ctx.storage.sql
        .exec(`CREATE TABLE IF NOT EXISTS tickets (ticket TEXT PRIMARY KEY, data TEXT NOT NULL,
        expires_at INTEGER NOT NULL)`);
    });
  }

  /* ---------- internal API (Worker only) ---------- */

  override async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    if (request.method === "POST" && url.pathname === "/ticket") {
      return this.issueTicket(request);
    }
    if (request.method === "GET" && url.pathname === "/connect") {
      return this.openSocket(request, url);
    }
    if (request.method === "POST" && url.pathname === "/event") {
      return this.event(request);
    }
    return new Response("not found", { status: 404 });
  }

  private async issueTicket(request: Request): Promise<Response> {
    const body = (await request.json().catch(() => null)) as Partial<TicketData> | null;
    if (
      body === null ||
      typeof body.canvas_id !== "string" ||
      typeof body.user_id !== "string" ||
      typeof body.name !== "string" ||
      typeof body.access !== "string" ||
      !ACCESS_LEVELS.includes(body.access)
    ) {
      return new Response("bad ticket request", { status: 400 });
    }
    const sql = this.ctx.storage.sql;
    const ticket = newHexId(32);
    const data: TicketData = {
      canvas_id: body.canvas_id,
      user_id: body.user_id,
      name: body.name,
      access: body.access as Access,
    };
    sql.exec("DELETE FROM tickets WHERE expires_at < ?", Date.now());
    sql.exec(
      "INSERT INTO tickets (ticket, data, expires_at) VALUES (?, ?, ?)",
      ticket,
      JSON.stringify(data),
      Date.now() + TICKET_TTL_MS,
    );
    return Response.json({ ticket });
  }

  private async openSocket(request: Request, url: URL): Promise<Response> {
    if (request.headers.get("Upgrade")?.toLowerCase() !== "websocket") {
      return new Response("expected a WebSocket upgrade", { status: 426 });
    }
    const sql = this.ctx.storage.sql;
    const ticket = url.searchParams.get("ticket") ?? "";
    // Single use: the ticket goes whether or not it is still valid.
    const found = sql
      .exec("SELECT data, expires_at FROM tickets WHERE ticket = ?", ticket)
      .toArray();
    sql.exec("DELETE FROM tickets WHERE ticket = ?", ticket);
    const row = found[0];
    if (row === undefined || num(row, "expires_at") < Date.now()) {
      return new Response("invalid ticket", { status: 401 });
    }
    const data = JSON.parse(str(row, "data")) as TicketData;

    try {
      await this.ensureLoaded(data.canvas_id);
    } catch (err) {
      if (err instanceof Error && err.message === "canvas_gone") {
        return new Response("not found", { status: 404 });
      }
      throw err;
    }

    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair) as [WebSocket, WebSocket];
    this.ctx.acceptWebSocket(server);
    const conn: Conn = {
      conn_id: newHexId(8),
      user_id: data.user_id,
      name: data.name,
      color: colorFor(data.user_id),
      access: data.access,
      cursor: null,
      selection: [],
      viewport: null,
    };
    server.serializeAttachment(conn);

    const peers: ReturnType<typeof peerOf>[] = [];
    for (const other of this.ctx.getWebSockets()) {
      if (other === server) continue;
      const otherConn = connOf(other);
      if (otherConn !== null) peers.push(peerOf(otherConn));
    }
    const items = [...this.requireItems().values()].filter((item) => !item.deleted);
    this.send(server, {
      t: "hello",
      you: {
        conn_id: conn.conn_id,
        user_id: conn.user_id,
        name: conn.name,
        color: conn.color,
        access: conn.access,
      },
      seq: this.seq,
      canvas: { title: this.title, archived: this.archived },
      items,
      peers,
    });
    this.broadcast({ t: "join", peer: peerOf(conn) }, server);
    return new Response(null, { status: 101, webSocket: client });
  }

  private async event(request: Request): Promise<Response> {
    const body = (await request.json().catch(() => null)) as {
      type?: string;
      title?: string;
    } | null;
    if (body === null || typeof body.type !== "string") {
      return new Response("bad event", { status: 400 });
    }

    switch (body.type) {
      case "archived":
      case "unarchived": {
        const archived = body.type === "archived";
        if (this.items !== null) await this.flush();
        this.archived = archived;
        this.setMeta("archived", archived ? "1" : "0");
        this.broadcast({ t: "canvas", archived });
        break;
      }
      case "title": {
        if (typeof body.title !== "string") return new Response("bad event", { status: 400 });
        this.title = body.title;
        this.setMeta("title", body.title);
        this.broadcast({ t: "canvas", title: body.title });
        break;
      }
      case "reconnect": {
        for (const ws of this.ctx.getWebSockets()) {
          this.send(ws, { t: "closed", reason: "reconnect" });
          try {
            ws.close(4001, "reconnect");
          } catch {
            // The socket is already closing.
          }
        }
        break;
      }
      case "deleted": {
        // The canvas row is gone. Do not flush: there is nowhere to write.
        await this.closeDeleted();
        break;
      }
      default:
        return new Response("bad event", { status: 400 });
    }
    return new Response(null, { status: 204 });
  }

  /* ---------- sockets ---------- */

  override async webSocketMessage(ws: WebSocket, message: string | ArrayBuffer): Promise<void> {
    if (typeof message !== "string") {
      this.send(ws, { t: "error", message: "Binary messages are not used." });
      return;
    }
    try {
      const msg = parseClientMessage(message);
      if ("error" in msg) {
        this.send(ws, { t: "error", message: msg.error });
        return;
      }
      const conn = connOf(ws);
      if (conn === null) {
        this.send(ws, { t: "error", message: "This connection is not in a canvas." });
        return;
      }

      if (msg.t === "ping") {
        this.send(ws, { t: "pong" });
        return;
      }

      if (msg.t === "presence") {
        conn.cursor = msg.cursor;
        conn.selection = msg.selection;
        conn.viewport = msg.viewport;
        ws.serializeAttachment(conn);
        this.broadcast({ t: "presence", ...peerOf(conn) }, ws);
        return;
      }

      // An op. The room must be loaded before it applies anything.
      const canvasId = this.meta("canvas_id");
      if (canvasId === null) throw new Error("the room has no canvas");
      await this.ensureLoaded(canvasId);
      const items = this.requireItems();
      const result = applyOp(items, msg, {
        userId: conn.user_id,
        access: conn.access,
        archived: this.archived,
        now: Date.now(),
      });
      if (!result.ok) {
        this.send(ws, {
          t: "reject",
          op_id: msg.op_id,
          reason: result.reason,
          message: result.message,
          item: result.item,
        });
        return;
      }

      this.seq += 1;
      this.upsertItem(result.item, 1);
      this.setMeta("seq", this.seq);
      this.send(ws, { t: "ack", op_id: msg.op_id, seq: this.seq, item: result.item });
      this.broadcast({ t: "applied", seq: this.seq, by: conn.user_id, item: result.item }, ws);
      if ((await this.ctx.storage.getAlarm()) === null) {
        await this.ctx.storage.setAlarm(Date.now() + 1000);
      }
    } catch (err) {
      console.error("canvas room message failed", err);
      this.send(ws, { t: "error", message: "Something went wrong." });
    }
  }

  override async webSocketClose(
    ws: WebSocket,
    code: number,
    reason: string,
    _wasClean: boolean,
  ): Promise<void> {
    this.leave(ws);
    try {
      ws.close(code, reason);
    } catch {
      // Some close codes cannot be echoed back; the socket is closed either way.
    }
    await this.flushIfLastSocket(ws);
  }

  override async webSocketError(ws: WebSocket, _error: unknown): Promise<void> {
    this.leave(ws);
    await this.flushIfLastSocket(ws);
  }

  override async alarm(): Promise<void> {
    await this.flush();
  }

  /* ---------- loading and storage ---------- */

  private requireItems(): Map<string, ItemState> {
    if (this.items === null) throw new Error("the room is not loaded");
    return this.items;
  }

  private meta(key: string): string | null {
    const row = this.ctx.storage.sql.exec("SELECT value FROM meta WHERE key = ?", key).toArray()[0];
    return row === undefined ? null : str(row, "value");
  }

  private setMeta(key: string, value: string | number): void {
    this.ctx.storage.sql.exec(
      "INSERT INTO meta (key, value) VALUES (?, ?) ON CONFLICT (key) DO UPDATE SET value = excluded.value",
      key,
      String(value),
    );
  }

  private upsertItem(item: ItemState, dirty: 0 | 1): void {
    this.ctx.storage.sql.exec(
      `INSERT INTO items (id, kind, z, version, props, deleted, created_by, updated_by, updated_at, dirty)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT (id) DO UPDATE SET kind = excluded.kind, z = excluded.z, version = excluded.version,
         props = excluded.props, deleted = excluded.deleted, created_by = excluded.created_by,
         updated_by = excluded.updated_by, updated_at = excluded.updated_at, dirty = excluded.dirty`,
      item.id,
      item.kind,
      item.z,
      item.version,
      JSON.stringify(item.props),
      item.deleted ? 1 : 0,
      item.created_by,
      item.updated_by,
      item.updated_at,
      dirty,
    );
  }

  /** Loads the room once: from SQLite if it has loaded before, otherwise from Postgres. */
  private async ensureLoaded(canvasId: string): Promise<void> {
    if (this.items !== null) return;
    if (this.loading === null) {
      this.loading = this.loadRoom(canvasId).finally(() => {
        this.loading = null;
      });
    }
    await this.loading;
  }

  private async loadRoom(canvasId: string): Promise<void> {
    this.setMeta("canvas_id", canvasId);

    if (this.meta("loaded") === "1") {
      const items = new Map<string, ItemState>();
      for (const row of this.ctx.storage.sql
        .exec(
          "SELECT id, kind, z, version, props, deleted, created_by, updated_by, updated_at FROM items",
        )
        .toArray()) {
        const item = rowToItem(row);
        items.set(item.id, item);
      }
      this.seq = Number(this.meta("seq") ?? 0);
      this.archived = this.meta("archived") === "1";
      this.title = this.meta("title") ?? "";
      this.items = items;
      return;
    }

    // A Durable Object outlives requests, so every client it opens is closed after use.
    const sql = getSql();
    let canvasRows: Awaited<ReturnType<typeof sql.unsafe>>;
    let rows: Awaited<ReturnType<typeof sql.unsafe>>;
    try {
      canvasRows =
        await sql`SELECT title, seq, archived_at FROM canvases WHERE id = ${canvasId}::text::uuid`;
      rows = await sql`SELECT id::text AS id, kind, z, version, props, deleted,
           created_by::text AS created_by, updated_by::text AS updated_by,
           (extract(epoch from updated_at) * 1000)::bigint AS updated_at
         FROM canvas_items WHERE canvas_id = ${canvasId}::text::uuid`;
    } finally {
      await sql.end({ timeout: 5 }).catch(() => undefined);
    }
    const canvas = canvasRows[0] as Record<string, unknown> | undefined;
    if (canvas === undefined) throw new Error("canvas_gone");

    const items = new Map<string, ItemState>();
    for (const r of rows) {
      const item: ItemState = {
        id: String(r["id"]),
        kind: String(r["kind"]) as ItemState["kind"],
        z: String(r["z"]),
        version: Number(r["version"]),
        props: (r["props"] ?? {}) as Record<string, unknown>,
        deleted: r["deleted"] === true,
        created_by: String(r["created_by"]),
        updated_by: String(r["updated_by"]),
        updated_at: Number(r["updated_at"]),
      };
      items.set(item.id, item);
    }

    const seq = Number(canvas["seq"]);
    for (const item of items.values()) this.upsertItem(item, 0);
    this.setMeta("seq", seq);
    this.setMeta("flushed_seq", seq);
    this.setMeta("archived", canvas["archived_at"] !== null ? "1" : "0");
    this.setMeta("title", String(canvas["title"]));
    this.setMeta("loaded", "1");

    this.seq = seq;
    this.archived = canvas["archived_at"] !== null;
    this.title = String(canvas["title"]);
    this.items = items;
  }

  /**
   * Writes dirty items to Postgres in one transaction. A canvas row that is gone means the canvas was deleted:
   * the sockets are closed and the storage is cleared.
   */
  private async flush(): Promise<void> {
    const canvasId = this.meta("canvas_id");
    if (canvasId === null) return;
    const sql = this.ctx.storage.sql;
    const dirty = sql
      .exec(
        "SELECT id, kind, z, version, props, deleted, created_by, updated_by, updated_at FROM items WHERE dirty = 1",
      )
      .toArray()
      .map(rowToItem);
    const seq = Number(this.meta("seq") ?? 0);
    const flushedSeq = Number(this.meta("flushed_seq") ?? 0);
    if (dirty.length === 0 && seq === flushedSeq) return;

    try {
      const pg = getSql();
      const deleted = await pg
        .begin(async (tx) => {
          const touched =
            await tx`UPDATE canvases SET seq = GREATEST(seq, ${seq}::bigint), updated_at = now()
           WHERE id = ${canvasId}::text::uuid RETURNING id::text AS id`;
          if (touched.length === 0) return true;
          for (const item of dirty) {
            const propsJson = JSON.stringify(item.props);
            await tx`INSERT INTO canvas_items (canvas_id, id, kind, z, version, props, deleted, created_by, created_at,
               updated_by, updated_at)
             VALUES (${canvasId}::text::uuid, ${item.id}::text::uuid, ${item.kind}::text, ${item.z}::text,
               ${item.version}::bigint, ${propsJson}::text::jsonb, ${item.deleted}::boolean,
               ${item.created_by}::text::uuid, to_timestamp(${item.updated_at}::double precision / 1000),
               ${item.updated_by}::text::uuid, to_timestamp(${item.updated_at}::double precision / 1000))
             ON CONFLICT (canvas_id, id) DO UPDATE SET z = EXCLUDED.z, version = EXCLUDED.version,
               props = EXCLUDED.props, deleted = EXCLUDED.deleted, updated_by = EXCLUDED.updated_by,
               updated_at = EXCLUDED.updated_at
             WHERE canvas_items.version < EXCLUDED.version`;
          }
          return false;
        })
        .finally(() => pg.end({ timeout: 5 }).catch(() => undefined));

      if (deleted) {
        await this.closeDeleted();
        return;
      }

      for (const item of dirty) {
        sql.exec("UPDATE items SET dirty = 0 WHERE id = ? AND version = ?", item.id, item.version);
      }
      this.setMeta("flushed_seq", seq);
      if (sql.exec("SELECT 1 FROM items WHERE dirty = 1 LIMIT 1").toArray().length > 0) {
        await this.ctx.storage.setAlarm(Date.now() + 1000);
      }
    } catch (err) {
      console.error("canvas room flush failed", canvasId, err);
      await this.ctx.storage.setAlarm(Date.now() + 5000);
    }
  }

  /** The canvas is gone: tell every socket, close them, and clear the room's storage. */
  private async closeDeleted(): Promise<void> {
    for (const ws of this.ctx.getWebSockets()) {
      this.send(ws, { t: "closed", reason: "deleted" });
      try {
        ws.close(4000, "deleted");
      } catch {
        // The socket is already closing.
      }
    }
    await this.ctx.storage.deleteAll();
    this.items = null;
    this.seq = 0;
    this.archived = false;
    this.title = "";
  }

  private async flushIfLastSocket(ws: WebSocket): Promise<void> {
    if (this.ctx.getWebSockets().some((other) => other !== ws)) return;
    await this.flush();
  }

  /* ---------- helpers ---------- */

  private leave(ws: WebSocket): void {
    const conn = connOf(ws);
    if (conn !== null) this.broadcast({ t: "leave", conn_id: conn.conn_id }, ws);
  }

  private broadcast(message: unknown, except?: WebSocket): void {
    const data = JSON.stringify(message);
    for (const ws of this.ctx.getWebSockets()) {
      if (ws === except) continue;
      try {
        ws.send(data);
      } catch (err) {
        console.error("canvas room broadcast failed", err);
      }
    }
  }

  private send(ws: WebSocket, message: unknown): void {
    try {
      ws.send(JSON.stringify(message));
    } catch (err) {
      console.error("canvas room send failed", err);
    }
  }
}
