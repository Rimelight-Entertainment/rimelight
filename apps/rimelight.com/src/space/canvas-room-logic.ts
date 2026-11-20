/**
 * Pure rules for Rimelight Space canvas rooms (CV.2, decision 0045): parsing of client WebSocket messages, applying item operations in arrival order and the presence colours. No I/O, so it is unit tested. The Durable Object room holds the items and sends the results.
 */

export const ITEM_KINDS = ["Image", "Text", "Shape", "Stroke", "Frame", "Video"] as const;
export type ItemKind = (typeof ITEM_KINDS)[number];
export const MAX_LIVE_ITEMS = 1000;
/** The longest raw text of one client message, in characters. */
export const MAX_MESSAGE_CHARS = 65536;
/** The longest JSON.stringify(props) of one item, in characters. */
export const MAX_PROPS_CHARS = 262144;
/** The most ids one presence message may select. */
export const MAX_SELECTION = 1000;
/** The longest item id of one media message, in characters. */
export const MAX_MEDIA_ITEM_ID_CHARS = 64;
/** The largest position of a shared video, in milliseconds (24 hours). */
export const MAX_MEDIA_POSITION_MS = 24 * 60 * 60 * 1000;
export const TICKET_TTL_MS = 60_000;
export type Access = "view" | "edit" | "manage";

/** One item as the room keeps it and sends it. updated_at is epoch milliseconds. */
export type ItemState = {
  id: string;
  kind: ItemKind;
  z: string;
  version: number;
  props: Record<string, unknown>;
  deleted: boolean;
  created_by: string;
  updated_by: string;
  updated_at: number;
};

/** One item operation from a client. base is the version the client last saw; it is checked by nothing, because fields are last-write-wins in arrival order. */
export type ClientOp = {
  t: "op";
  op_id: string;
  item_id: string;
  base: number;
  action: "create" | "update" | "delete";
  kind?: ItemKind;
  z?: string;
  props?: Record<string, unknown>;
};

/** The visible area of a client, in canvas units. */
export type Viewport = { x: number; y: number; zoom: number; w: number; h: number };

/** A client's cursor, selection and view, sent often and not stored. */
export type ClientPresence = {
  t: "presence";
  cursor: { x: number; y: number } | null;
  selection: string[];
  viewport: Viewport | null;
};

/** A play, pause, seek or end of a shared video, sent by a person who can edit the canvas. */
export type ClientMedia = {
  t: "media";
  item_id: string;
  playing: boolean;
  position_ms: number;
  ended: boolean;
};

/** The shared playback of one item as the room keeps and sends it. at is the server time (ms since epoch); by is the sender's conn_id. */
export type MediaState = {
  item_id: string;
  playing: boolean;
  position_ms: number;
  at: number;
  by: string;
  ended: boolean;
};

export type ClientMessage = ClientOp | ClientPresence | ClientMedia | { t: "ping" };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const Z_ORDER = /^[0-9A-Za-z]{1,64}$/;
const PRESENCE_ERROR = "The presence message is not valid.";
const OP_ERROR = "The op is not valid.";
const MEDIA_ERROR = "The media message is not valid.";

/** True for a plain JSON object: not null and not an array. */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** True for a number that is neither NaN nor infinite. */
function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

/** True for one of ITEM_KINDS. */
function isItemKind(value: unknown): value is ItemKind {
  return typeof value === "string" && (ITEM_KINDS as readonly string[]).includes(value);
}

/** True for a string shaped like a UUID, in either letter case. */
function isUuid(value: unknown): value is string {
  return typeof value === "string" && UUID.test(value);
}

/** Reads a presence message; null when any field is wrong. Missing cursor, selection or viewport mean null, null and []. */
function parsePresence(data: Record<string, unknown>): ClientPresence | null {
  const rawCursor = data["cursor"] ?? null;
  let cursor: { x: number; y: number } | null = null;
  if (rawCursor !== null) {
    if (!isRecord(rawCursor)) return null;
    const x = rawCursor["x"];
    const y = rawCursor["y"];
    if (!isFiniteNumber(x) || !isFiniteNumber(y)) return null;
    cursor = { x, y };
  }

  const rawSelection = data["selection"] ?? [];
  if (!Array.isArray(rawSelection) || rawSelection.length > MAX_SELECTION) return null;
  const selection: string[] = [];
  for (const id of rawSelection) {
    if (!isUuid(id)) return null;
    selection.push(id.toLowerCase());
  }

  const rawViewport = data["viewport"] ?? null;
  let viewport: Viewport | null = null;
  if (rawViewport !== null) {
    if (!isRecord(rawViewport)) return null;
    const x = rawViewport["x"];
    const y = rawViewport["y"];
    const zoom = rawViewport["zoom"];
    const w = rawViewport["w"];
    const h = rawViewport["h"];
    if (!isFiniteNumber(x) || !isFiniteNumber(y) || !isFiniteNumber(zoom)) return null;
    if (!isFiniteNumber(w) || !isFiniteNumber(h)) return null;
    if (zoom <= 0 || w < 0 || h < 0) return null;
    viewport = { x, y, zoom, w, h };
  }

  return { t: "presence", cursor, selection, viewport };
}

/** Reads an op message; null when any field is wrong. Optional fields are kept only when present. */
function parseOp(data: Record<string, unknown>): ClientOp | null {
  const opId = data["op_id"];
  const itemId = data["item_id"];
  const base = data["base"];
  const action = data["action"];
  const kind = data["kind"];
  const z = data["z"];
  const props = data["props"];

  if (typeof opId !== "string" || opId.length < 1 || opId.length > 64) return null;
  if (!isUuid(itemId)) return null;
  if (typeof base !== "number" || !Number.isSafeInteger(base) || base < 0) return null;
  if (action !== "create" && action !== "update" && action !== "delete") return null;
  if (kind !== undefined && !isItemKind(kind)) return null;
  if (z !== undefined && (typeof z !== "string" || !Z_ORDER.test(z))) return null;
  if (props !== undefined && !isRecord(props)) return null;

  return {
    t: "op",
    op_id: opId,
    item_id: itemId.toLowerCase(),
    base,
    action,
    ...(isItemKind(kind) ? { kind } : {}),
    ...(typeof z === "string" ? { z } : {}),
    ...(isRecord(props) ? { props } : {}),
  };
}

/** Reads a media message; null when any field is wrong. The item id is kept in lower case, like op ids. */
function parseMedia(data: Record<string, unknown>): ClientMedia | null {
  const itemId = data["item_id"];
  const playing = data["playing"];
  const positionMs = data["position_ms"];
  const ended = data["ended"];

  if (typeof itemId !== "string" || itemId.length < 1 || itemId.length > MAX_MEDIA_ITEM_ID_CHARS) {
    return null;
  }
  if (typeof playing !== "boolean" || typeof ended !== "boolean") return null;
  if (!isFiniteNumber(positionMs) || positionMs < 0 || positionMs > MAX_MEDIA_POSITION_MS) {
    return null;
  }

  return {
    t: "media",
    item_id: itemId.toLowerCase(),
    playing,
    position_ms: Math.round(positionMs),
    ended,
  };
}

/**
 * Parses the text of one client WebSocket message. Returns the message with only its known fields, or { error } with a message the client can show. Rejects text longer than MAX_MESSAGE_CHARS before parsing.
 */
export function parseClientMessage(raw: string): ClientMessage | { error: string } {
  if (raw.length > MAX_MESSAGE_CHARS) return { error: "The message is too large." };
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return { error: "The message is not JSON." };
  }
  if (!isRecord(data)) return { error: "The message is not a JSON object." };

  const t = data["t"];
  if (t === "ping") return { t: "ping" };
  if (t === "presence") return parsePresence(data) ?? { error: PRESENCE_ERROR };
  if (t === "op") return parseOp(data) ?? { error: OP_ERROR };
  if (t === "media") return parseMedia(data) ?? { error: MEDIA_ERROR };
  return { error: "Unknown message type." };
}

export type MediaResult = { ok: true; event: MediaState } | { ok: false; message: string };

/**
 * Applies one media message from a connection. Viewers are refused, and so is an item that is missing or deleted. On success it sets the shared state of the item in `media`, or removes it when the message ends the playback, and returns the state to send to everyone. On failure it never changes the maps.
 */
export function applyMedia(
  media: Map<string, MediaState>,
  items: Map<string, ItemState>,
  msg: ClientMedia,
  ctx: { connId: string; access: Access; now: number },
): MediaResult {
  if (ctx.access === "view") return { ok: false, message: "Viewers cannot control playback." };
  const item = items.get(msg.item_id);
  if (!item || item.deleted) return { ok: false, message: "That item is not on this canvas." };

  const event: MediaState = {
    item_id: msg.item_id,
    playing: msg.playing,
    position_ms: msg.position_ms,
    at: ctx.now,
    by: ctx.connId,
    ended: msg.ended,
  };
  if (msg.ended) media.delete(msg.item_id);
  else media.set(msg.item_id, event);
  return { ok: true, event };
}

export type ApplyResult =
  | { ok: true; item: ItemState }
  | {
      ok: false;
      reason: "forbidden" | "invalid" | "not_found" | "exists" | "limit";
      message: string;
      item: ItemState | null;
    };

type Refusal = Extract<ApplyResult, { ok: false }>;
type Context = { userId: string; access: Access; archived: boolean; now: number };

/** A refused result; the item is the current state of the item when there is one, else null. */
function refuse(reason: Refusal["reason"], message: string, item: ItemState | null): Refusal {
  return { ok: false, reason, message, item };
}

/** True when the props, as JSON, are longer than MAX_PROPS_CHARS. */
function propsTooLarge(props: Record<string, unknown>): boolean {
  return JSON.stringify(props).length > MAX_PROPS_CHARS;
}

/** Creates a live item at op.item_id. Refuses an id that is already used, even by a deleted item. */
function createItem(
  items: Map<string, ItemState>,
  op: ClientOp,
  ctx: Context,
  current: ItemState | null,
): ApplyResult {
  if (current) return refuse("exists", "An item with this id already exists.", current);
  const { kind, z } = op;
  if (kind === undefined || z === undefined) {
    return refuse("invalid", "A new item needs a kind and a z order.", null);
  }
  if (liveCount(items) >= MAX_LIVE_ITEMS) {
    return refuse("limit", "A canvas holds at most 1000 items.", null);
  }
  // A copy, so the item never shares its props object with the message.
  const props: Record<string, unknown> = { ...op.props };
  if (propsTooLarge(props)) return refuse("invalid", "The item is too large.", null);

  const item: ItemState = {
    id: op.item_id,
    kind,
    z,
    version: 1,
    props,
    deleted: false,
    created_by: ctx.userId,
    updated_by: ctx.userId,
    updated_at: ctx.now,
  };
  items.set(op.item_id, item);
  return { ok: true, item };
}

/**
 * Merges an update into a live item. Props are merged key by key: a null value removes the key. The new state is a new object, so the old state is never changed. op.base is not checked; a later update simply wins.
 */
function updateItem(
  items: Map<string, ItemState>,
  op: ClientOp,
  ctx: Context,
  current: ItemState | null,
): ApplyResult {
  if (!current || current.deleted) {
    return refuse("not_found", "The item no longer exists.", current);
  }
  if (op.kind !== undefined && op.kind !== current.kind) {
    return refuse("invalid", "An item's kind cannot change.", current);
  }
  const props: Record<string, unknown> = { ...current.props };
  for (const [key, value] of Object.entries(op.props ?? {})) {
    if (value === null) delete props[key];
    else props[key] = value;
  }
  if (propsTooLarge(props)) return refuse("invalid", "The item is too large.", current);

  const next: ItemState = {
    ...current,
    props,
    z: op.z ?? current.z,
    version: current.version + 1,
    updated_by: ctx.userId,
    updated_at: ctx.now,
  };
  items.set(op.item_id, next);
  return { ok: true, item: next };
}

/** Marks a live item deleted. The item stays in the map, so its id cannot be reused. */
function deleteItem(
  items: Map<string, ItemState>,
  op: ClientOp,
  ctx: Context,
  current: ItemState | null,
): ApplyResult {
  if (!current || current.deleted) {
    return refuse("not_found", "The item no longer exists.", current);
  }
  const next: ItemState = {
    ...current,
    props: { ...current.props },
    deleted: true,
    version: current.version + 1,
    updated_by: ctx.userId,
    updated_at: ctx.now,
  };
  items.set(op.item_id, next);
  return { ok: true, item: next };
}

/**
 * Applies one client operation to the room's items. On success it sets the new state under op.item_id in `items`; on failure it never changes the map. A view-only or archived canvas refuses every operation. Operations are applied in arrival order, so the last write to a field wins.
 */
export function applyOp(
  items: Map<string, ItemState>,
  op: ClientOp,
  ctx: { userId: string; access: Access; archived: boolean; now: number },
): ApplyResult {
  const current = items.get(op.item_id) ?? null;
  if (ctx.archived) {
    return refuse("forbidden", "This canvas is archived, so it is read-only.", current);
  }
  if (ctx.access === "view") {
    return refuse("forbidden", "You can view this canvas but not change it.", current);
  }
  if (op.action === "create") return createItem(items, op, ctx, current);
  if (op.action === "update") return updateItem(items, op, ctx, current);
  return deleteItem(items, op, ctx, current);
}

/** The number of items that are not deleted. Deleted items do not count toward MAX_LIVE_ITEMS. */
export function liveCount(items: Map<string, ItemState>): number {
  let count = 0;
  for (const item of items.values()) {
    if (!item.deleted) count += 1;
  }
  return count;
}

const COLORS = [
  "#e5484d",
  "#f76b15",
  "#ffc53d",
  "#30a46c",
  "#12a594",
  "#0090ff",
  "#8e4ec6",
  "#d6409f",
] as const;

/** A colour for a user's cursor. Deterministic: the same user id always gets the same colour. */
export function colorFor(userId: string): string {
  let sum = 0;
  for (let i = 0; i < userId.length; i += 1) sum += userId.charCodeAt(i);
  return COLORS[sum % COLORS.length] ?? "#e5484d";
}

/** `bytes` random bytes from crypto.getRandomValues, as lower-case hex: 2 * bytes characters. */
export function newHexId(bytes: number): string {
  const buffer = new Uint8Array(bytes);
  crypto.getRandomValues(buffer);
  return [...buffer].map((b) => b.toString(16).padStart(2, "0")).join("");
}
