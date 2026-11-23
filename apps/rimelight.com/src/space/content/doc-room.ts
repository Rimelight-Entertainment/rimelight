/**
 * The live room for one Rimelight Space content document (Space CMS.3, decision 0049). A Durable Object, one room per
 * name: `main:<pageId>` (the page's main document) or `draft:<draftId>` (one author's draft). Same pattern as
 * CanvasRoom: sockets use the WebSocket hibernation API, and the room is the authority while it is alive.
 *
 * The room holds the Loro document in memory and writes its latest snapshot to its SQLite storage on every change, so
 * a room that hibernates or restarts reloads without Postgres. Postgres gets the document from an alarm 30 s after the
 * first unflushed change, and when the last socket closes. A room that starts cold loads from Postgres.
 *
 * Only the Worker calls this object (content-live.ts): the RPC methods below, and the fetch paths /ticket, /connect
 * and /event. The frames on the socket are described in doc-room-logic.ts.
 */
import { DurableObject } from "cloudflare:workers";
import { LoroDoc, VersionVector } from "loro-crdt";
// UNSURE: the collab entry is written by another agent; the signatures are as the brief gave them.
import {
  configure,
  exportPage,
  forkDraft,
  importPage,
  replaceContent as replaceDocContent,
} from "./collab/index.ts";
import { getSql } from "../../db/index.ts";
import {
  FRAME,
  type FrameType,
  type RoomKind,
  decodeFrame,
  encodeEventFrame,
  encodeFrame,
  flushAlarmAt,
  retryAlarmAt,
  ticketIsValid,
} from "./doc-room-logic.ts";

type RoomInit = { kind: RoomKind; pageId: string; draftId?: string };

/** What the Worker stores with a ticket. A read-only socket may read and share presence, never write. */
type TicketData = { user_id: string; name: string; readonly: boolean };

/** Per-socket state, kept on the socket so it survives hibernation. */
type Conn = TicketData;

type SqlRow = Record<string, SqlStorageValue>;
type Pg = ReturnType<typeof getSql>;

const str = (row: SqlRow, key: string): string =>
  String(row[key] as string | number | boolean | null);
const num = (row: SqlRow, key: string): number => Number(row[key]);

function connOf(ws: WebSocket): Conn | null {
  const raw = ws.deserializeAttachment() as Conn | null | undefined;
  return raw ?? null;
}

function newTicket(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

function newDoc(): LoroDoc {
  const doc = new LoroDoc();
  configure(doc);
  return doc;
}

function docFromBytes(bytes: Uint8Array): LoroDoc {
  const doc = newDoc();
  doc.import(bytes);
  return doc;
}

/** Runs queries on a fresh client, closed after use: a Durable Object outlives requests. */
async function withPg<T>(run: (sql: Pg) => Promise<T>): Promise<T> {
  const sql = getSql();
  try {
    return await run(sql);
  } finally {
    await sql.end({ timeout: 5 }).catch(() => undefined);
  }
}

/**
 * The page's main document: from content_docs when saved, otherwise built from the pages row. With persist set, a
 * built document is saved to content_docs; without it nothing is written (a draft only reads main to fork it).
 */
async function loadMainDoc(pageId: string, persist: boolean): Promise<LoroDoc> {
  return withPg(async (sql) => {
    const saved = await sql`SELECT loro FROM content_docs WHERE page_id = ${pageId}::text::uuid`;
    const bytes = saved[0]?.["loro"] as Uint8Array | null | undefined;
    if (bytes) return docFromBytes(bytes);

    // UNSURE: the pages column names are taken from the brief (meta fields plus content).
    const pages =
      await sql`SELECT slug, type, title, description, tags, template_id, template_version, content
      FROM pages WHERE id = ${pageId}::text::uuid`;
    const page = pages[0] as Record<string, unknown> | undefined;
    if (page === undefined) throw new Error("page_gone");
    const doc = importPage({
      meta: {
        slug: page["slug"],
        type: page["type"],
        title: page["title"],
        description: page["description"],
        tags: page["tags"],
        template_id: page["template_id"],
        template_version: page["template_version"],
      },
      content: page["content"],
    } as unknown as Parameters<typeof importPage>[0]);
    if (persist) {
      // UNSURE: postgres.js binding a Uint8Array to bytea; if it rejects, wrap it in Buffer.
      const snapshot = doc.export({ mode: "snapshot" });
      await sql`INSERT INTO content_docs (page_id, loro, updated_at)
        VALUES (${pageId}::text::uuid, ${snapshot}, now())
        ON CONFLICT (page_id) DO UPDATE SET loro = EXCLUDED.loro, updated_at = EXCLUDED.updated_at`;
    }
    return doc;
  });
}

/** A draft's document: its saved Loro bytes, or, the first time, a fork of main saved as the draft's bytes. */
async function loadDraftDoc(draftId: string): Promise<LoroDoc> {
  const rows = await withPg(
    (sql) =>
      sql`SELECT page_id::text AS page_id, loro FROM content_drafts WHERE id = ${draftId}::text::uuid`,
  );
  const row = rows[0] as Record<string, unknown> | undefined;
  if (row === undefined) throw new Error("draft_gone");
  const saved = row["loro"] as Uint8Array | null;
  if (saved) return docFromBytes(saved);

  const main = await loadMainDoc(String(row["page_id"]), false);
  const doc = forkDraft(main);
  const snapshot = doc.export({ mode: "snapshot" });
  await withPg(
    (sql) => sql`UPDATE content_drafts SET loro = ${snapshot} WHERE id = ${draftId}::text::uuid`,
  );
  return doc;
}

export class DocRoom extends DurableObject {
  private doc: LoroDoc | null = null;
  private loading: Promise<LoroDoc> | null = null;
  /** Changes made since the room started. A flush that wrote an older count leaves the room dirty. */
  private changes = 0;
  /** The document version already persisted in SQLite (snapshot plus the appended updates). */
  private savedVersion: VersionVector | null = null;

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    void this.ctx.blockConcurrencyWhile(async () => {
      this.ctx.storage.sql.exec(
        "CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY, value TEXT NOT NULL)",
      );
      this.ctx.storage.sql.exec(
        "CREATE TABLE IF NOT EXISTS snapshot (id INTEGER PRIMARY KEY CHECK (id = 1), bytes BLOB NOT NULL)",
      );
      // Small Loro updates appended since the last snapshot; replayed on restart, cleared by each snapshot.
      this.ctx.storage.sql.exec(
        "CREATE TABLE IF NOT EXISTS updates (seq INTEGER PRIMARY KEY AUTOINCREMENT, bytes BLOB NOT NULL)",
      );
      this.ctx.storage.sql
        .exec(`CREATE TABLE IF NOT EXISTS tickets (ticket TEXT PRIMARY KEY, data TEXT NOT NULL,
        expires_at INTEGER NOT NULL)`);
      // Reload the latest snapshot before any request, so a restarted room needs no Postgres.
      this.doc = this.docFromSnapshot();
    });
  }

  /* ---------- internal fetch paths (Worker only) ---------- */

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
      typeof body.user_id !== "string" ||
      typeof body.name !== "string" ||
      typeof body.readonly !== "boolean"
    ) {
      return new Response("bad ticket request", { status: 400 });
    }
    const sql = this.ctx.storage.sql;
    const ticket = newTicket();
    const data: TicketData = { user_id: body.user_id, name: body.name, readonly: body.readonly };
    sql.exec("DELETE FROM tickets WHERE expires_at < ?", Date.now());
    sql.exec(
      "INSERT INTO tickets (ticket, data, expires_at) VALUES (?, ?, ?)",
      ticket,
      JSON.stringify(data),
      Date.now() + 60_000,
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
    if (row === undefined || !ticketIsValid(num(row, "expires_at"), Date.now())) {
      return new Response("invalid ticket", { status: 401 });
    }
    if (this.meta("closed") === "1") {
      return new Response("closed", { status: 410 });
    }
    const data = JSON.parse(str(row, "data")) as TicketData;

    try {
      await this.ensureLoaded();
    } catch (err) {
      if (err instanceof Error && (err.message === "draft_gone" || err.message === "page_gone")) {
        return new Response("not found", { status: 404 });
      }
      throw err;
    }

    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair) as [WebSocket, WebSocket];
    this.ctx.acceptWebSocket(server);
    const conn: Conn = { user_id: data.user_id, name: data.name, readonly: data.readonly };
    server.serializeAttachment(conn);
    server.send(encodeFrame(FRAME.SNAPSHOT, this.requireDoc().export({ mode: "snapshot" })));
    return new Response(null, { status: 101, webSocket: client });
  }

  /** Events from the REST routes: "closed" closes the room; the others are passed to every socket. */
  private async event(request: Request): Promise<Response> {
    const body = (await request.json().catch(() => null)) as {
      type?: unknown;
      reason?: unknown;
    } | null;
    if (body === null || typeof body.type !== "string") {
      return new Response("bad event", { status: 400 });
    }
    if (body.type === "closed") {
      await this.close(typeof body.reason === "string" ? body.reason : "closed");
      return new Response(null, { status: 204 });
    }
    if (body.type !== "comments" && body.type !== "published") {
      return new Response("bad event", { status: 400 });
    }
    this.broadcast(encodeEventFrame(body as { type: string }));
    return new Response(null, { status: 204 });
  }

  /* ---------- RPC methods (Worker only, through the stub) ---------- */

  /** Records which document this room is and loads it. Idempotent; a different document is refused. */
  async init(p: RoomInit): Promise<void> {
    if (p.kind !== "main" && p.kind !== "draft") throw new Error("bad room kind");
    const draftId = p.kind === "draft" ? p.draftId : undefined;
    if (p.kind === "draft" && typeof draftId !== "string") {
      throw new Error("a draft room needs a draft id");
    }
    const have = this.meta("kind");
    if (have === null) {
      this.setMeta("kind", p.kind);
      this.setMeta("page_id", p.pageId);
      this.setMeta("draft_id", draftId ?? "");
    } else if (
      have !== p.kind ||
      this.meta("page_id") !== p.pageId ||
      (this.meta("draft_id") ?? "") !== (draftId ?? "")
    ) {
      throw new Error("room_mismatch");
    }
    await this.ensureLoaded();
  }

  /** The state vector, so a client can ask for exactly the updates it lacks. */
  async versionVector(): Promise<Uint8Array> {
    const doc = await this.ready();
    return doc.oplogVersion().encode();
  }

  /** Updates since a version vector, or the whole document when none is given. */
  async exportUpdatesSince(vv: Uint8Array | null): Promise<Uint8Array> {
    const doc = await this.ready();
    if (vv === null) return doc.export({ mode: "snapshot" });
    return doc.export({ mode: "update", from: VersionVector.decode(vv) });
  }

  /** Imports updates made outside a socket (a REST change), shows them to every socket, and schedules a flush. */
  async importUpdates(bytes: Uint8Array): Promise<void> {
    if (this.meta("closed") === "1") throw new Error("room_closed");
    const doc = await this.ready();
    doc.import(bytes);
    this.noteChange();
    this.broadcast(encodeFrame(FRAME.UPDATE, bytes));
    await this.scheduleFlush();
  }

  /**
   * Replaces a draft's blocks and properties in one change (a REST or MCP edit). Every socket gets the change as an
   * update frame, exactly like importUpdates, and the change is flushed the same way. Main rooms are not edited.
   */
  async replaceContent(content: {
    blocks: unknown[];
    properties: Record<string, unknown>;
  }): Promise<void> {
    if (this.meta("closed") === "1") throw new Error("room_closed");
    if (this.requireMeta("kind") !== "draft") throw new Error("only a draft room is edited");
    const doc = await this.ready();
    doc.commit();
    const before = doc.oplogVersion();
    replaceDocContent(doc, content);
    const bytes = doc.export({ mode: "update", from: before });
    this.noteChange();
    this.broadcast(encodeFrame(FRAME.UPDATE, bytes));
    await this.scheduleFlush();
  }

  /** What main would look like with these updates merged in. Nothing is kept: the fork is discarded. */
  async previewMerge(bytes: Uint8Array): Promise<ReturnType<typeof exportPage>> {
    const doc = await this.ready();
    const preview = doc.fork();
    preview.import(bytes);
    return exportPage(preview);
  }

  /** The document as the page's {meta, content} JSON. */
  async snapshotJson(): Promise<ReturnType<typeof exportPage>> {
    const doc = await this.ready();
    return exportPage(doc);
  }

  /**
   * Closes the room: every socket is told and closed, new sockets are refused, and the document is flushed. The
   * closed mark is kept in storage, so a restarted room stays closed.
   */
  async close(reason: string): Promise<void> {
    this.setMeta("closed", "1");
    for (const ws of this.ctx.getWebSockets()) {
      this.sendEvent(ws, { type: "closed", reason });
      try {
        ws.close(4000, "closed");
      } catch {
        // The socket is already closing.
      }
    }
    await this.flush();
  }

  /* ---------- sockets ---------- */

  override async webSocketMessage(ws: WebSocket, message: string | ArrayBuffer): Promise<void> {
    if (typeof message === "string") {
      this.sendEvent(ws, { type: "error", message: "Binary frames only." });
      return;
    }
    const frame = decodeFrame(message);
    if (!frame.ok) {
      this.sendEvent(ws, { type: "error", message: frame.message });
      return;
    }
    const conn = connOf(ws);
    if (conn === null) {
      this.sendEvent(ws, { type: "error", message: "This connection is not in a room." });
      return;
    }

    try {
      if (frame.type === FRAME.EPHEMERAL) {
        this.relay(ws, FRAME.EPHEMERAL, frame.payload);
        return;
      }
      if (frame.type !== FRAME.UPDATE) {
        this.sendEvent(ws, { type: "error", message: "The server does not take this frame." });
        return;
      }
      if (conn.readonly) {
        this.sendEvent(ws, { type: "readonly" });
        return;
      }
      if (this.meta("closed") === "1") {
        this.sendEvent(ws, { type: "closed", reason: "closed" });
        return;
      }
      const doc = await this.ready();
      doc.import(frame.payload);
      this.noteChange();
      this.relay(ws, FRAME.UPDATE, frame.payload);
      await this.scheduleFlush();
    } catch (err) {
      console.error("doc room message failed", err);
      this.sendEvent(ws, { type: "error", message: "Something went wrong." });
    }
  }

  override async webSocketClose(
    ws: WebSocket,
    code: number,
    reason: string,
    _wasClean: boolean,
  ): Promise<void> {
    try {
      ws.close(code, reason);
    } catch {
      // Some close codes cannot be echoed back; the socket is closed either way.
    }
    await this.flushIfLastSocket(ws);
  }

  override async webSocketError(ws: WebSocket, _error: unknown): Promise<void> {
    await this.flushIfLastSocket(ws);
  }

  override async alarm(): Promise<void> {
    await this.flush();
  }

  /* ---------- loading and storage ---------- */

  private meta(key: string): string | null {
    const row = this.ctx.storage.sql.exec("SELECT value FROM meta WHERE key = ?", key).toArray()[0];
    return row === undefined ? null : str(row, "value");
  }

  private requireMeta(key: string): string {
    const value = this.meta(key);
    if (value === null) throw new Error("room_not_initialised");
    return value;
  }

  private setMeta(key: string, value: string): void {
    this.ctx.storage.sql.exec(
      "INSERT INTO meta (key, value) VALUES (?, ?) ON CONFLICT (key) DO UPDATE SET value = excluded.value",
      key,
      value,
    );
  }

  private requireDoc(): LoroDoc {
    if (this.doc === null) throw new Error("the room is not loaded");
    return this.doc;
  }

  /** The document, loaded from SQLite or, when neither has it, from Postgres. The room must be initialised. */
  private async ready(): Promise<LoroDoc> {
    this.requireMeta("kind");
    return this.ensureLoaded();
  }

  private docFromSnapshot(): LoroDoc | null {
    const row = this.ctx.storage.sql.exec("SELECT bytes FROM snapshot WHERE id = 1").toArray()[0];
    if (row === undefined) return null;
    const doc = docFromBytes(new Uint8Array(row["bytes"] as ArrayBuffer));
    for (const u of this.ctx.storage.sql.exec("SELECT bytes FROM updates ORDER BY seq").toArray()) {
      doc.import(new Uint8Array(u["bytes"] as ArrayBuffer));
    }
    this.savedVersion = doc.oplogVersion();
    return doc;
  }

  private async ensureLoaded(): Promise<LoroDoc> {
    if (this.doc !== null) return this.doc;
    if (this.loading === null) {
      this.loading = this.loadRoom()
        .then(() => this.requireDoc())
        .finally(() => {
          this.loading = null;
        });
    }
    await this.loading;
    return this.requireDoc();
  }

  private async loadRoom(): Promise<void> {
    const kind = this.requireMeta("kind");
    const doc =
      kind === "main"
        ? await loadMainDoc(this.requireMeta("page_id"), true)
        : await loadDraftDoc(this.requireMeta("draft_id"));
    this.doc = doc;
    this.saveSnapshot();
    this.setMeta("dirty", "0");
  }

  /** Writes the whole document to SQLite and clears the appended updates (on load and on each flush). */
  private saveSnapshot(): void {
    const doc = this.doc;
    if (doc === null) return;
    this.ctx.storage.sql.exec(
      "INSERT INTO snapshot (id, bytes) VALUES (1, ?) ON CONFLICT (id) DO UPDATE SET bytes = excluded.bytes",
      doc.export({ mode: "snapshot" }),
    );
    this.ctx.storage.sql.exec("DELETE FROM updates");
    this.savedVersion = doc.oplogVersion();
  }

  /**
   * Records a change: only the new Loro update is appended to SQLite (cheap, so a restart loses nothing), and the
   * room is dirty until a flush writes the full document to SQLite and Postgres.
   */
  private noteChange(): void {
    this.changes += 1;
    this.setMeta("dirty", "1");
    const doc = this.doc;
    if (doc === null) return;
    if (this.savedVersion === null) {
      this.saveSnapshot();
      return;
    }
    const update = doc.export({ mode: "update", from: this.savedVersion });
    this.ctx.storage.sql.exec("INSERT INTO updates (bytes) VALUES (?)", update);
    this.savedVersion = doc.oplogVersion();
  }

  private async scheduleFlush(): Promise<void> {
    const pending = await this.ctx.storage.getAlarm();
    await this.ctx.storage.setAlarm(flushAlarmAt(Date.now(), pending));
  }

  /** Writes the document to Postgres if it changed since the last write. */
  private async flush(): Promise<void> {
    const doc = this.doc;
    if (doc === null || this.meta("dirty") !== "1") return;
    const kind = this.meta("kind");
    const id = kind === "draft" ? this.meta("draft_id") : this.meta("page_id");
    if (kind !== "main" && kind !== "draft") return;
    if (id === null) return;

    const captured = this.changes;
    this.saveSnapshot();
    const snapshot = doc.export({ mode: "snapshot" });
    try {
      await withPg(async (sql) => {
        if (kind === "main") {
          await sql`INSERT INTO content_docs (page_id, loro, updated_at)
            VALUES (${id}::text::uuid, ${snapshot}, now())
            ON CONFLICT (page_id) DO UPDATE SET loro = EXCLUDED.loro, updated_at = EXCLUDED.updated_at`;
        } else {
          await sql`UPDATE content_drafts SET loro = ${snapshot} WHERE id = ${id}::text::uuid`;
        }
      });
    } catch (err) {
      console.error("doc room flush failed", kind, id, err);
      await this.ctx.storage.setAlarm(retryAlarmAt(Date.now()));
      return;
    }
    if (this.changes === captured) {
      this.setMeta("dirty", "0");
    } else {
      // A change arrived during the write; it is not in this snapshot, so the room stays dirty.
      await this.scheduleFlush();
    }
  }

  private async flushIfLastSocket(ws: WebSocket): Promise<void> {
    if (this.ctx.getWebSockets().some((other) => other !== ws)) return;
    await this.flush();
  }

  /* ---------- helpers ---------- */

  /** Relays a frame to every socket except the sender. Ephemeral frames are never stored. */
  private relay(from: WebSocket, type: FrameType, payload: Uint8Array): void {
    const frame = encodeFrame(type, payload);
    for (const ws of this.ctx.getWebSockets()) {
      if (ws === from) continue;
      try {
        ws.send(frame);
      } catch (err) {
        console.error("doc room relay failed", err);
      }
    }
  }

  private broadcast(frame: Uint8Array): void {
    for (const ws of this.ctx.getWebSockets()) {
      try {
        ws.send(frame);
      } catch (err) {
        console.error("doc room broadcast failed", err);
      }
    }
  }

  private sendEvent(ws: WebSocket, event: { type: string } & Record<string, unknown>): void {
    try {
      ws.send(encodeEventFrame(event));
    } catch (err) {
      console.error("doc room send failed", err);
    }
  }
}
