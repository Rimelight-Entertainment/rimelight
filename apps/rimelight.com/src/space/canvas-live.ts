/**
 * Live canvas routes on the website Worker (Space CV.3, decision 0045): the ticket that opens a live socket, the
 * socket itself, and notifyRoom, which tells an open room about a change made through the REST routes.
 * Mounted under /v1 by the Space API.
 *
 * Both the native and the web clients connect with a ticket, because a browser cannot set headers on a WebSocket.
 * The ticket is single use and lasts 60 seconds; the socket route checks no session, so the ticket is the credential.
 */
import { Hono } from "hono";
import { env } from "cloudflare:workers";
import { getDb } from "../db/index.ts";
import { loadCanvas, json, serverError, uuidOr404 } from "./canvas-access.ts";
import { caller, isResponse } from "./session.ts";

type RoomBindings = { CANVAS_ROOM: DurableObjectNamespace };

/** An event the REST routes send to an open room after a change. */
export type RoomEvent = {
  type: "archived" | "unarchived" | "deleted" | "reconnect" | "title";
  title?: string;
};

const NO_CANVAS = "There is no such canvas.";

/** The room for one canvas: a Durable Object named by the canvas id. */
function roomStub(canvasId: string) {
  const ns = (env as unknown as RoomBindings).CANVAS_ROOM;
  return ns.get(ns.idFromName(canvasId));
}

const live = new Hono();

/**
 * POST /v1/canvases/{id}/live-ticket: a single-use ticket for the live socket, with the path to connect to.
 * Needs view access; the room gives the socket the caller's access as it is now.
 */
live.post("/canvases/:id/live-ticket", async (c) => {
  const who = await caller(c);
  if (isResponse(who)) return who;
  try {
    const sql = getDb().$client;
    const canvas = await loadCanvas(sql, who.id, c.req.param("id"), "view", {
      includeArchived: true,
    });
    if (isResponse(canvas)) return canvas;
    const res = await roomStub(canvas.id).fetch("https://canvas-room/ticket", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        canvas_id: canvas.id,
        user_id: who.id,
        name: who.display_name,
        access: canvas.access,
      }),
    });
    if (!res.ok) return serverError();
    const { ticket } = (await res.json()) as { ticket: string };
    return json({
      ticket,
      expires_in_s: 60,
      path: `/v1/canvases/${canvas.id}/live?ticket=${ticket}`,
    });
  } catch (err) {
    console.error("space POST /canvases/:id/live-ticket failed", err);
    return serverError();
  }
});

/**
 * GET /v1/canvases/{id}/live?ticket=...: upgrades to the live WebSocket of the canvas's room. No session check: the
 * ticket is the credential, and the room checks it.
 */
live.get("/canvases/:id/live", async (c) => {
  if (c.req.header("Upgrade")?.toLowerCase() !== "websocket") {
    return json({ error: "upgrade_required", message: "Connect with a WebSocket." }, 426);
  }
  const id = uuidOr404(c.req.param("id"), NO_CANVAS);
  if (typeof id !== "string") return id;
  const ticket = c.req.query("ticket") ?? "";
  return roomStub(id).fetch(
    new Request(`https://canvas-room/connect?ticket=${encodeURIComponent(ticket)}&canvas=${id}`, {
      headers: c.req.raw.headers,
    }),
  );
});

/**
 * Tells the canvas's open room about a change. Called after the database change has succeeded. Never throws: a
 * room that cannot be reached is logged, and its sockets learn the new state when they next connect.
 */
export async function notifyRoom(canvasId: string, event: RoomEvent): Promise<void> {
  try {
    const res = await roomStub(canvasId).fetch("https://canvas-room/event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(event),
    });
    if (!res.ok) {
      console.error("canvas room notify failed", canvasId, res.status);
    }
  } catch (err) {
    console.error("canvas room notify failed", canvasId, err);
  }
}

export default live;
