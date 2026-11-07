import { describe, expect, it } from "vite-plus/test";
import type { TitlePresetRow } from "../src/db/schema/title-presets";
import {
  fitsStoredLimit,
  parsePresetSlot,
  presetBodySchema,
  presetList,
  presetView,
} from "../src/api/routes/v1/title-presets";
import { byteLength, MAX_STORED_BYTES } from "../src/api/routes/v1/title-settings";

const snapshot = {
  audio: { masterVolume: 0.8, muted: false, label: "x" },
  video: { vsync: true },
};

describe("presetBodySchema", () => {
  it("accepts a name and a two-level snapshot of scalars", () => {
    const parsed = presetBodySchema.safeParse({ name: "Raid", settings: snapshot });
    expect(parsed.success).toBe(true);
    expect(parsed.success && parsed.data.settings).toEqual(snapshot);
  });

  it("trims the name before the length check", () => {
    const parsed = presetBodySchema.safeParse({ name: "  Raid  ", settings: {} });
    expect(parsed.success && parsed.data.name).toBe("Raid");
    expect(presetBodySchema.safeParse({ name: "   ", settings: {} }).success).toBe(false);
  });

  it("accepts a name of exactly 32 characters and rejects 33", () => {
    expect(presetBodySchema.safeParse({ name: "a".repeat(32), settings: {} }).success).toBe(true);
    expect(presetBodySchema.safeParse({ name: "a".repeat(33), settings: {} }).success).toBe(false);
  });

  it.each([
    ["null value", { audio: { masterVolume: null } }],
    ["object value", { audio: { nested: { x: 1 } } }],
    ["array value", { audio: { list: [1, 2] } }],
    ["non-finite number", { audio: { v: Number.POSITIVE_INFINITY } }],
    ["invalid category name", { Audio: { masterVolume: 1 } }],
    ["invalid key name", { audio: { "master-volume": 1 } }],
    ["string over 256 chars", { audio: { s: "a".repeat(257) } }],
  ])("rejects settings with %s", (_label, settings) => {
    expect(presetBodySchema.safeParse({ name: "Raid", settings }).success).toBe(false);
  });
});

describe("parsePresetSlot", () => {
  it.each([
    ["1", 1],
    ["5", 5],
  ])("accepts slot %s", (raw, slot) => {
    expect(parsePresetSlot(raw)).toBe(slot);
  });

  it.each(["0", "6", "-1", "1.5", "01x", "", "abc"])("rejects slot %j", (raw) => {
    expect(parsePresetSlot(raw)).toBeNull();
  });
});

describe("fitsStoredLimit", () => {
  const big = (categories: number) =>
    Object.fromEntries(
      Array.from({ length: categories }, (_, i) => [`cat${i}`, { v: "x".repeat(256) }]),
    );

  it("accepts a snapshot under the cap", () => {
    const settings = big(100);
    expect(byteLength(settings)).toBeLessThanOrEqual(MAX_STORED_BYTES);
    expect(fitsStoredLimit(settings)).toBe(true);
  });

  it("rejects a snapshot over the cap", () => {
    const settings = big(240);
    expect(byteLength(settings)).toBeGreaterThan(MAX_STORED_BYTES);
    expect(fitsStoredLimit(settings)).toBe(false);
  });
});

describe("presetList", () => {
  const row = (slot: number, name: string): TitlePresetRow => ({
    userId: "11111111-1111-4111-8111-111111111111",
    title: "grand-tale",
    slot,
    name,
    settings: snapshot,
    version: 2,
    updatedAt: new Date("2026-11-06T12:00:00.000Z"),
  });

  it("always returns five entries, with empty slots as null and slot 1 at index 0", () => {
    const list = presetList([row(3, "Raid")]);
    expect(list).toHaveLength(5);
    expect(list[0]).toBeNull();
    expect(list[1]).toBeNull();
    expect(list[2]).toEqual({
      slot: 3,
      name: "Raid",
      version: 2,
      updatedAt: "2026-11-06T12:00:00.000Z",
      settings: snapshot,
    });
    expect(list[4]).toBeNull();
  });

  it("serialises a row with an ISO timestamp", () => {
    expect(presetView(row(1, "Solo")).updatedAt).toBe("2026-11-06T12:00:00.000Z");
  });
});
