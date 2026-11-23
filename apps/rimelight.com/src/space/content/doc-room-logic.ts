/**
 * Pure helpers for the live content room (Rimelight Space CMS.3, decision 0049): the wire frames, room names, ticket
 * timing and flush timing. No Loro and no storage here, so the tests load no runtime code.
 *
 * Wire protocol. Every WebSocket frame is binary: the first byte is the message type, the rest is the payload.
 *   server -> client
 *     0x00  snapshot    the whole Loro document, sent once when a socket joins
 *     0x01  update      a Loro update (a co-editor's change, or a REST change imported by the Worker)
 *     0x02  ephemeral   an ephemeral-store update (presence): relayed, never stored
 *     0x03  event       UTF-8 JSON with a "type": "comments" | "closed" | "published" | "readonly" | "error"
 *   client -> server
 *     0x01  update      a Loro update. From a read-only socket it is refused: the server sends 0x03 {"type":"readonly"}
 *                       and imports nothing.
 *     0x02  ephemeral   presence. Relayed to the other sockets, never stored.
 * Text frames are refused with a 0x03 {"type":"error"} event. A frame above MAX_FRAME_BYTES is refused the same way.
 */

export const FRAME = { SNAPSHOT: 0x00, UPDATE: 0x01, EPHEMERAL: 0x02, EVENT: 0x03 } as const;
export type FrameType = (typeof FRAME)[keyof typeof FRAME];

/** A single frame larger than this is refused. A whole document snapshot is the largest frame a room sends. */
export const MAX_FRAME_BYTES = 8 * 1024 * 1024;
export const TICKET_TTL_MS = 60_000;
/** The room writes to Postgres this long after the first unflushed change. */
export const FLUSH_DELAY_MS = 30_000;
/** A failed Postgres write is retried this long later. */
export const FLUSH_RETRY_MS = 5_000;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type RoomKind = "main" | "draft";
export type RoomRef = { kind: RoomKind; id: string };

/** `main:<pageId>` or `draft:<draftId>`. */
export function roomName(kind: RoomKind, id: string): string {
  return `${kind}:${id}`;
}

/** The room a name points at, or null when the name is not a valid room name. */
export function parseRoomName(name: string): RoomRef | null {
  const match = /^(main|draft):(.+)$/.exec(name);
  if (match === null) return null;
  const kind = match[1] as RoomKind;
  const id = match[2] ?? "";
  if (!UUID.test(id)) return null;
  return { kind, id };
}

/** Encodes one frame: the type byte, then the payload. */
export function encodeFrame(type: FrameType, payload: Uint8Array = new Uint8Array(0)): Uint8Array {
  const out = new Uint8Array(payload.length + 1);
  out[0] = type;
  out.set(payload, 1);
  return out;
}

export type DecodedFrame =
  | { ok: true; type: FrameType; payload: Uint8Array }
  | { ok: false; message: string };

const FRAME_TYPES: readonly number[] = Object.values(FRAME);

/** Splits a received frame into its type and payload. Refuses empty, oversized and unknown frames. */
export function decodeFrame(data: ArrayBuffer | Uint8Array): DecodedFrame {
  const bytes = data instanceof Uint8Array ? data : new Uint8Array(data);
  if (bytes.length === 0) return { ok: false, message: "The frame is empty." };
  if (bytes.length > MAX_FRAME_BYTES) return { ok: false, message: "The frame is too large." };
  const type = bytes[0] ?? -1;
  if (!FRAME_TYPES.includes(type)) return { ok: false, message: "The frame type is not known." };
  return { ok: true, type: type as FrameType, payload: bytes.subarray(1) };
}

/** A server event: a type byte 0x03, then the JSON text. */
export function encodeEventFrame(event: { type: string } & Record<string, unknown>): Uint8Array {
  return encodeFrame(FRAME.EVENT, new TextEncoder().encode(JSON.stringify(event)));
}

/** Reads the JSON of an event frame's payload. Null when it is not a JSON object with a string type. */
export function decodeEventPayload(payload: Uint8Array): Record<string, unknown> | null {
  try {
    const value: unknown = JSON.parse(new TextDecoder().decode(payload));
    if (typeof value !== "object" || value === null || Array.isArray(value)) return null;
    const record = value as Record<string, unknown>;
    return typeof record["type"] === "string" ? record : null;
  } catch {
    return null;
  }
}

/** A ticket is single use and valid up to its expiry instant (inclusive). */
export function ticketIsValid(expiresAt: number, now: number): boolean {
  return expiresAt >= now;
}

export function ticketExpiry(now: number): number {
  return now + TICKET_TTL_MS;
}

/**
 * The alarm time for the next flush. A flush already scheduled keeps its time, so the 30 s window runs from the
 * first unflushed change and later changes do not push it back.
 */
export function flushAlarmAt(now: number, pendingAlarm: number | null): number {
  return pendingAlarm ?? now + FLUSH_DELAY_MS;
}

export function retryAlarmAt(now: number): number {
  return now + FLUSH_RETRY_MS;
}
