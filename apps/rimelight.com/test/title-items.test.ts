import { describe, expect, it } from "vite-plus/test";
import { ITEM_MAX_AMOUNT, itemCapsFor } from "../src/api/title-items";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

describe("itemCapsFor", () => {
  it("gives every Grand Tale item the one-billion cap", () => {
    const caps = itemCapsFor("grand-tale");
    expect(Object.keys(caps)).toHaveLength(10);
    for (const cap of Object.values(caps)) {
      expect(cap).toBe(ITEM_MAX_AMOUNT);
    }
  });

  it("keys every item by a UUIDv4", () => {
    for (const id of Object.keys(itemCapsFor("grand-tale"))) {
      expect(id).toMatch(UUID);
    }
  });

  it("does not list currencies as items", () => {
    expect(itemCapsFor("grand-tale")["Currency.Gold"]).toBeUndefined();
  });
});
