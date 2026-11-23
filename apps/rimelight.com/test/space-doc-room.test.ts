import { describe, expect, it } from "vite-plus/test";
import {
  FLUSH_DELAY_MS,
  FLUSH_RETRY_MS,
  FRAME,
  MAX_FRAME_BYTES,
  TICKET_TTL_MS,
  decodeEventPayload,
  decodeFrame,
  encodeEventFrame,
  encodeFrame,
  flushAlarmAt,
  parseRoomName,
  retryAlarmAt,
  roomName,
  ticketExpiry,
  ticketIsValid,
} from "../src/space/content/doc-room-logic.ts";

const PAGE = "11111111-1111-4111-8111-111111111111";
const DRAFT = "22222222-2222-4222-8222-222222222222";

describe("room names", () => {
  it("builds main and draft names", () => {
    expect(roomName("main", PAGE)).toBe(`main:${PAGE}`);
    expect(roomName("draft", DRAFT)).toBe(`draft:${DRAFT}`);
  });

  it("parses a valid name back to its kind and id", () => {
    expect(parseRoomName(`draft:${DRAFT}`)).toEqual({ kind: "draft", id: DRAFT });
    expect(parseRoomName(`main:${PAGE}`)).toEqual({ kind: "main", id: PAGE });
  });

  it("refuses an unknown kind, a missing id and a non-uuid id", () => {
    expect(parseRoomName(`canvas:${PAGE}`)).toBeNull();
    expect(parseRoomName("main:")).toBeNull();
    expect(parseRoomName("main:not-a-uuid")).toBeNull();
    expect(parseRoomName(PAGE)).toBeNull();
  });
});

describe("frames", () => {
  it("encodes the type byte then the payload", () => {
    const frame = encodeFrame(FRAME.UPDATE, new Uint8Array([7, 8]));
    expect(Array.from(frame)).toEqual([0x01, 7, 8]);
  });

  it("encodes a frame with no payload as the type byte alone", () => {
    expect(Array.from(encodeFrame(FRAME.SNAPSHOT))).toEqual([0x00]);
  });

  it("decodes a frame back to its type and payload", () => {
    const decoded = decodeFrame(encodeFrame(FRAME.EPHEMERAL, new Uint8Array([9, 10])));
    expect(decoded).toEqual({ ok: true, type: FRAME.EPHEMERAL, payload: new Uint8Array([9, 10]) });
  });

  it("decodes from an ArrayBuffer as a WebSocket delivers it", () => {
    const buffer = encodeFrame(FRAME.UPDATE, new Uint8Array([1])).buffer as ArrayBuffer;
    const decoded = decodeFrame(buffer);
    expect(decoded.ok && decoded.type).toBe(FRAME.UPDATE);
  });

  it("refuses an empty frame", () => {
    expect(decodeFrame(new Uint8Array(0)).ok).toBe(false);
  });

  it("refuses an unknown type byte", () => {
    expect(decodeFrame(new Uint8Array([0x7f, 1])).ok).toBe(false);
  });

  it("refuses a frame over the size limit", () => {
    const big = new Uint8Array(MAX_FRAME_BYTES + 1);
    big[0] = FRAME.UPDATE;
    expect(decodeFrame(big).ok).toBe(false);
  });

  it("keeps the wire type values from the protocol", () => {
    expect(FRAME).toEqual({ SNAPSHOT: 0, UPDATE: 1, EPHEMERAL: 2, EVENT: 3 });
  });
});

describe("event frames", () => {
  it("sends a 0x03 frame with the JSON text", () => {
    const frame = encodeEventFrame({ type: "closed", reason: "published" });
    expect(frame[0]).toBe(FRAME.EVENT);
    expect(decodeEventPayload(frame.subarray(1))).toEqual({ type: "closed", reason: "published" });
  });

  it("reads back null for a payload that is not an event object", () => {
    expect(decodeEventPayload(new TextEncoder().encode("[1,2]"))).toBeNull();
    expect(decodeEventPayload(new TextEncoder().encode('{"no":"type"}'))).toBeNull();
    expect(decodeEventPayload(new TextEncoder().encode("not json"))).toBeNull();
  });
});

describe("ticket timing", () => {
  it("expires a ticket 60 seconds after issue", () => {
    expect(TICKET_TTL_MS).toBe(60_000);
    expect(ticketExpiry(1_000)).toBe(61_000);
  });

  it("is valid up to and including its expiry, and not after", () => {
    expect(ticketIsValid(5_000, 4_999)).toBe(true);
    expect(ticketIsValid(5_000, 5_000)).toBe(true);
    expect(ticketIsValid(5_000, 5_001)).toBe(false);
  });
});

describe("flush timing", () => {
  it("schedules the first flush 30 seconds after the first unflushed change", () => {
    expect(FLUSH_DELAY_MS).toBe(30_000);
    expect(flushAlarmAt(1_000, null)).toBe(31_000);
  });

  it("keeps a flush already scheduled rather than pushing it back", () => {
    expect(flushAlarmAt(20_000, 31_000)).toBe(31_000);
  });

  it("retries a failed write after 5 seconds", () => {
    expect(FLUSH_RETRY_MS).toBe(5_000);
    expect(retryAlarmAt(1_000)).toBe(6_000);
  });
});
