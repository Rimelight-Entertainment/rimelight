/**
 * Live content routes on the website Worker (Space CMS.3, decision 0049): the tickets that open a live socket on a
 * page's main document or on one author draft, the socket itself, and notifyDoc, which tells an open room about a
 * change made through the REST routes. Mounted under /v1 by the Space API (api.ts registers the default export).
 *
 * As for canvases, the browser cannot set headers on a WebSocket, so the ticket is the credential: single use, 60 s.
 * Access is checked when the ticket is issued, not when the socket connects.
 */
import { Hono } from "hono";
import { env } from "cloudflare:workers";
import type { DocRoom } from "./doc-room.ts";
import { getSql } from "../../db/index.ts";
import { apiError, forbidden, json, notFound, serverError } from "../canvas-access.ts";
import {
  canOpenDraft,
  draftFacts,
  draftPageAccess,
  loadDraft,
  loadPage,
} from "./content-access.ts";
import { caller, isResponse } from "../session.ts";
import { parseRoomName, roomName } from "./doc-room-logic.ts";

const NO_ROOM = "There is no such room.";

type RoomBindings = { DOC_ROOM: DurableObjectNamespace<DocRoom> };

/** An event the REST routes send to an open room. "closed" closes the room; the others reach every socket. */
export type DocEvent = { type: string };

/** A page document as JSON (`exportPage`'s result). */
export type PageJson = { meta: Record<string, unknown>; content: Record<string, unknown> };

/**
 * The `DocRoom` RPC surface the routes call. Written out because the type the Workers runtime infers for
 * a Durable Object stub is too deep for the type checker on some return types.
 */
export interface DocRoomRpc {
  fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response>;
  init(p: { kind: "main" | "draft"; pageId: string; draftId?: string }): Promise<void>;
  versionVector(): Promise<Uint8Array>;
  exportUpdatesSince(vv: Uint8Array | null): Promise<Uint8Array>;
  importUpdates(bytes: Uint8Array): Promise<void>;
  replaceContent(content: {
    blocks: unknown[];
    properties: Record<string, unknown>;
  }): Promise<void>;
  previewMerge(bytes: Uint8Array): Promise<PageJson>;
  snapshotJson(): Promise<PageJson>;
  close(reason: string): Promise<void>;
}

/** The room for one document: a Durable Object named by the room name. */
export function docRoomStub(name: string): DocRoomRpc {
  const ns = (env as unknown as RoomBindings).DOC_ROOM;
  return ns.get(ns.idFromName(name)) as unknown as DocRoomRpc;
}

const live = new Hono();

/** Opens a room for the document, then issues a ticket on it. The caller has already checked access. */
async function issueRoomTicket(
  name: string,
  init: { kind: "main"; pageId: string } | { kind: "draft"; pageId: string; draftId: string },
  who: { id: string; display_name: string },
  readonly: boolean,
): Promise<Response> {
  const stub = docRoomStub(name);
  await stub.init(init);
  const res = await stub.fetch("https://doc-room/ticket", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: who.id, name: who.display_name, readonly }),
  });
  if (!res.ok) return serverError();
  const { ticket } = (await res.json()) as { ticket: string };
  return json({
    ticket,
    expires_in_s: 60,
    path: `/v1/content/live/${encodeURIComponent(name)}?ticket=${ticket}`,
  });
}

/**
 * POST /v1/content/drafts/{id}/live-ticket: a single-use ticket for the draft's room. The caller must be the author or
 * a member, the draft must be Open, and the caller must be able to edit the page (canOpenDraft). Edit access on the
 * draft is therefore not read-only: its sockets may write.
 */
live.post("/content/drafts/:id/live-ticket", async (c) => {
  const who = await caller(c);
  if (isResponse(who)) return who;
  try {
    const sql = getSql();
    const draft = await loadDraft(sql, c.req.param("id"));
    if (isResponse(draft)) return draft;
    const pageLevel = await draftPageAccess(sql, who.id, draft);
    if (!canOpenDraft(who.id, draftFacts(draft), pageLevel)) {
      return forbidden("You cannot open this draft.");
    }
    if (draft.status !== "Open") {
      return apiError(409, "draft_closed", "This draft is no longer open.");
    }
    return await issueRoomTicket(
      roomName("draft", draft.id),
      { kind: "draft", pageId: draft.pageId, draftId: draft.id },
      who,
      false,
    );
  } catch (err) {
    console.error("space POST /content/drafts/:id/live-ticket failed", err);
    return serverError();
  }
});

/**
 * POST /v1/content/pages/{id}/live-ticket: a single-use ticket for the page's main room. Anyone with view access may
 * join, and the socket is read-only (reviewers follow the published line; changes reach main only by publish).
 */
live.post("/content/pages/:id/live-ticket", async (c) => {
  const who = await caller(c);
  if (isResponse(who)) return who;
  try {
    const sql = getSql();
    const found = await loadPage(sql, who.id, c.req.param("id"), "view");
    if (isResponse(found)) return found;
    return await issueRoomTicket(
      roomName("main", found.page.id),
      { kind: "main", pageId: found.page.id },
      who,
      true,
    );
  } catch (err) {
    console.error("space POST /content/pages/:id/live-ticket failed", err);
    return serverError();
  }
});

/**
 * GET /v1/content/live/{room}?ticket=...: upgrades to the live WebSocket of the room. No session check: the ticket is
 * the credential, and the room checks it.
 */
live.get("/content/live/:room", async (c) => {
  if (c.req.header("Upgrade")?.toLowerCase() !== "websocket") {
    return json({ error: "upgrade_required", message: "Connect with a WebSocket." }, 426);
  }
  const name = c.req.param("room");
  if (parseRoomName(name) === null) return notFound(NO_ROOM);
  const ticket = c.req.query("ticket") ?? "";
  return docRoomStub(name).fetch(
    new Request(`https://doc-room/connect?ticket=${encodeURIComponent(ticket)}`, {
      headers: c.req.raw.headers,
    }),
  );
});

/**
 * Tells a document's open room about a change. Called after the database change has succeeded. Never throws: a room
 * that cannot be reached is logged, and its sockets learn the new state when they next connect.
 */
export async function notifyDoc(name: string, event: DocEvent): Promise<void> {
  try {
    const res = await docRoomStub(name).fetch("https://doc-room/event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(event),
    });
    if (!res.ok) {
      console.error("doc room notify failed", name, res.status);
    }
  } catch (err) {
    console.error("doc room notify failed", name, err);
  }
}

export default live;
