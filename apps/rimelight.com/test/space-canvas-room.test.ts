import { describe, expect, it } from "vite-plus/test";
import {
  type Access,
  type ApplyResult,
  applyOp,
  type ClientOp,
  colorFor,
  type ItemState,
  liveCount,
  MAX_PROPS_CHARS,
  newHexId,
  parseClientMessage,
} from "../src/space/canvas-room-logic";

const ITEM = "11111111-1111-4111-8111-111111111111";
const OTHER_ITEM = "11111111-1111-4111-8111-222222222222";
const USER = "22222222-2222-4222-8222-222222222222";

type Ctx = { userId: string; access: Access; archived: boolean; now: number };

const ctx = (over: Partial<Ctx> = {}): Ctx => ({
  userId: USER,
  access: "edit",
  archived: false,
  now: 1_000,
  ...over,
});

/** A fresh item id for index n, valid as a UUID. */
const uid = (n: number): string => `00000000-0000-4000-8000-${n.toString(16).padStart(12, "0")}`;

/** The item from a successful result; throws with the refusal otherwise. */
function okItem(result: ApplyResult): ItemState {
  if (!result.ok) throw new Error(`Expected ok, got ${result.reason}: ${result.message}`);
  return result.item;
}

function createOp(itemId: string, props: Record<string, unknown> = {}): ClientOp {
  return {
    t: "op",
    op_id: `op-${itemId}`,
    item_id: itemId,
    base: 0,
    action: "create",
    kind: "Text",
    z: "a1",
    props,
  };
}

function updateOp(itemId: string, props: Record<string, unknown>): ClientOp {
  return { t: "op", op_id: "u-1", item_id: itemId, base: 1, action: "update", props };
}

const deleteOp = (itemId: string): ClientOp => ({
  t: "op",
  op_id: "d-1",
  item_id: itemId,
  base: 1,
  action: "delete",
});

describe("parseClientMessage", () => {
  it("parses ping", () => {
    expect(parseClientMessage('{"t":"ping"}')).toEqual({ t: "ping" });
  });

  it("parses a valid presence message", () => {
    const msg = parseClientMessage(
      JSON.stringify({
        t: "presence",
        cursor: { x: 1, y: 2 },
        selection: ["AAAAAAAA-1111-4111-8111-111111111111"],
        viewport: { x: 0, y: 0, zoom: 1, w: 800, h: 600 },
      }),
    );
    expect(msg).toEqual({
      t: "presence",
      cursor: { x: 1, y: 2 },
      selection: ["aaaaaaaa-1111-4111-8111-111111111111"],
      viewport: { x: 0, y: 0, zoom: 1, w: 800, h: 600 },
    });
  });

  it("defaults missing presence fields to null and []", () => {
    expect(parseClientMessage('{"t":"presence"}')).toEqual({
      t: "presence",
      cursor: null,
      selection: [],
      viewport: null,
    });
  });

  it("refuses a presence selection that is not a UUID", () => {
    expect(parseClientMessage('{"t":"presence","selection":["nope"]}')).toEqual({
      error: "The presence message is not valid.",
    });
  });

  it("parses a valid create op with props", () => {
    const raw = JSON.stringify(createOp(ITEM, { text: "hi" }));
    expect(parseClientMessage(raw)).toEqual({
      t: "op",
      op_id: `op-${ITEM}`,
      item_id: ITEM,
      base: 0,
      action: "create",
      kind: "Text",
      z: "a1",
      props: { text: "hi" },
    });
  });

  it("refuses ops with bad fields", () => {
    const bad: unknown[] = [
      { ...createOp(ITEM), item_id: "not-a-uuid" },
      { ...createOp(ITEM), base: -1 },
      { ...createOp(ITEM), action: "upsert" },
      { ...createOp(ITEM), z: "a-b" },
      { ...createOp(ITEM), props: [1, 2] },
    ];
    for (const message of bad) {
      expect(parseClientMessage(JSON.stringify(message))).toEqual({
        error: "The op is not valid.",
      });
    }
  });

  it("refuses text that is not JSON", () => {
    expect(parseClientMessage("{not json")).toEqual({ error: "The message is not JSON." });
  });

  it("refuses a message longer than the limit", () => {
    expect(parseClientMessage("a".repeat(70000))).toEqual({
      error: "The message is too large.",
    });
  });

  it("refuses an unknown message type", () => {
    expect(parseClientMessage('{"t":"hello"}')).toEqual({ error: "Unknown message type." });
  });

  it("leaves out optional op fields when they are absent", () => {
    const msg = parseClientMessage(
      JSON.stringify({ t: "op", op_id: "x", item_id: ITEM, base: 0, action: "delete" }),
    );
    expect("error" in msg).toBe(false);
    expect("kind" in msg).toBe(false);
    expect("z" in msg).toBe(false);
    expect("props" in msg).toBe(false);
  });
});

describe("applyOp", () => {
  it("creates an item at version 1 with its creator", () => {
    const items = new Map<string, ItemState>();
    const item = okItem(applyOp(items, createOp(ITEM, { text: "hi" }), ctx()));
    expect(items.get(ITEM)?.version).toBe(1);
    expect(item.version).toBe(1);
    expect(item.created_by).toBe(USER);
    expect(item.updated_by).toBe(USER);
    expect(item.updated_at).toBe(1_000);
    expect(item.deleted).toBe(false);
  });

  it("refuses a second create with the same id", () => {
    const items = new Map<string, ItemState>();
    applyOp(items, createOp(ITEM), ctx());
    const result = applyOp(items, createOp(ITEM), ctx());
    expect(result).toMatchObject({ ok: false, reason: "exists" });
  });

  it("refuses a create without a z order", () => {
    const items = new Map<string, ItemState>();
    const op: ClientOp = {
      t: "op",
      op_id: "c",
      item_id: ITEM,
      base: 0,
      action: "create",
      kind: "Text",
    };
    expect(applyOp(items, op, ctx())).toMatchObject({ ok: false, reason: "invalid" });
    expect(items.size).toBe(0);
  });

  it("refuses every op for a view-only user and leaves the map unchanged", () => {
    const items = new Map<string, ItemState>();
    applyOp(items, createOp(ITEM), ctx());
    const before = JSON.stringify([...items.entries()]);
    const result = applyOp(items, createOp(OTHER_ITEM), ctx({ access: "view" }));
    expect(result).toMatchObject({ ok: false, reason: "forbidden" });
    expect(JSON.stringify([...items.entries()])).toBe(before);
  });

  it("refuses every op on an archived canvas", () => {
    const items = new Map<string, ItemState>();
    const result = applyOp(items, createOp(ITEM), ctx({ archived: true }));
    expect(result).toMatchObject({ ok: false, reason: "forbidden" });
    expect(items.size).toBe(0);
  });

  it("merges update props: sets one key, removes a key given null, bumps version, keeps kind", () => {
    const items = new Map<string, ItemState>();
    applyOp(items, createOp(ITEM, { a: 1, b: 2 }), ctx());
    const item = okItem(applyOp(items, updateOp(ITEM, { a: 5, b: null }), ctx({ now: 2_000 })));
    expect(item.props).toEqual({ a: 5 });
    expect(item.version).toBe(2);
    expect(item.kind).toBe("Text");
    expect(item.updated_at).toBe(2_000);
  });

  it("refuses an update after delete", () => {
    const items = new Map<string, ItemState>();
    applyOp(items, createOp(ITEM), ctx());
    applyOp(items, deleteOp(ITEM), ctx());
    expect(applyOp(items, updateOp(ITEM, { a: 1 }), ctx())).toMatchObject({
      ok: false,
      reason: "not_found",
    });
  });

  it("refuses an update that changes the kind", () => {
    const items = new Map<string, ItemState>();
    applyOp(items, createOp(ITEM), ctx());
    const op: ClientOp = { ...updateOp(ITEM, {}), kind: "Shape" };
    expect(applyOp(items, op, ctx())).toMatchObject({ ok: false, reason: "invalid" });
    expect(items.get(ITEM)?.kind).toBe("Text");
  });

  it("marks an item deleted and bumps its version", () => {
    const items = new Map<string, ItemState>();
    applyOp(items, createOp(ITEM), ctx());
    const item = okItem(applyOp(items, deleteOp(ITEM), ctx()));
    expect(item.deleted).toBe(true);
    expect(item.version).toBe(2);
  });

  it("refuses a second delete with not_found", () => {
    const items = new Map<string, ItemState>();
    applyOp(items, createOp(ITEM), ctx());
    applyOp(items, deleteOp(ITEM), ctx());
    expect(applyOp(items, deleteOp(ITEM), ctx())).toMatchObject({
      ok: false,
      reason: "not_found",
    });
  });

  it("refuses the 1001st live item with limit", () => {
    const items = new Map<string, ItemState>();
    for (let i = 0; i < 1000; i += 1) okItem(applyOp(items, createOp(uid(i)), ctx()));
    expect(liveCount(items)).toBe(1000);
    expect(applyOp(items, createOp(uid(1000)), ctx())).toMatchObject({
      ok: false,
      reason: "limit",
    });
  });

  it("does not count deleted items toward the limit: one deleted and 1000 live still refuses", () => {
    const items = new Map<string, ItemState>();
    okItem(applyOp(items, createOp(uid(0)), ctx()));
    okItem(applyOp(items, deleteOp(uid(0)), ctx()));
    for (let i = 1; i <= 1000; i += 1) okItem(applyOp(items, createOp(uid(i)), ctx()));
    expect(liveCount(items)).toBe(1000);
    expect(applyOp(items, createOp(uid(1001)), ctx())).toMatchObject({
      ok: false,
      reason: "limit",
    });
  });

  it("allows a create with 999 live and 5 deleted items", () => {
    const items = new Map<string, ItemState>();
    for (let i = 0; i < 5; i += 1) {
      okItem(applyOp(items, createOp(uid(i)), ctx()));
      okItem(applyOp(items, deleteOp(uid(i)), ctx()));
    }
    for (let i = 5; i < 1004; i += 1) okItem(applyOp(items, createOp(uid(i)), ctx()));
    expect(liveCount(items)).toBe(999);
    okItem(applyOp(items, createOp(uid(1004)), ctx()));
    expect(liveCount(items)).toBe(1000);
    expect(applyOp(items, createOp(uid(1005)), ctx())).toMatchObject({
      ok: false,
      reason: "limit",
    });
  });

  it("refuses props larger than the limit", () => {
    const items = new Map<string, ItemState>();
    const big = { blob: "x".repeat(MAX_PROPS_CHARS) };
    expect(applyOp(items, createOp(ITEM, big), ctx())).toMatchObject({
      ok: false,
      reason: "invalid",
    });
    expect(items.size).toBe(0);
  });

  it("does not mutate the props of the old state on update", () => {
    const items = new Map<string, ItemState>();
    applyOp(items, createOp(ITEM, { a: 1, b: 2 }), ctx());
    const oldProps = items.get(ITEM)?.props;
    if (!oldProps) throw new Error("The item is missing.");
    const snapshot = { ...oldProps };
    const updated = okItem(applyOp(items, updateOp(ITEM, { a: 9, b: null }), ctx()));
    expect(oldProps).toEqual(snapshot);
    expect(updated.props).not.toBe(oldProps);
    expect(updated.props).toEqual({ a: 9 });
  });
});

describe("colorFor and newHexId", () => {
  const COLOURS = [
    "#e5484d",
    "#f76b15",
    "#ffc53d",
    "#30a46c",
    "#12a594",
    "#0090ff",
    "#8e4ec6",
    "#d6409f",
  ];

  it("gives the same colour for the same user and one of the eight colours", () => {
    const first = colorFor(USER);
    expect(colorFor(USER)).toBe(first);
    expect(COLOURS).toContain(first);
    expect(COLOURS).toContain(colorFor(""));
  });

  it("makes newHexId lower-case hex of 2 * bytes characters", () => {
    const id = newHexId(8);
    expect(id).toHaveLength(16);
    expect(id).toMatch(/^[0-9a-f]{16}$/);
  });
});
