import { describe, expect, it } from "vite-plus/test";
import type { TitlePresetRow } from "../src/db/schema/title-presets";
import {
  parsePresetSlot,
  presetBodyFits,
  presetBodySchema,
  presetList,
  presetView,
} from "../src/api/routes/v1/title-presets";

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

describe("presetBodyFits", () => {
  // Pinned to GTSettingsDocument::MaxBodyBytes (16 KB): 16384 bytes accepted, 16385 refused.
  it("accepts a body of exactly 16384 bytes", () => {
    expect(presetBodyFits("x".repeat(16384))).toBe(true);
  });

  it("refuses a body of 16385 bytes", () => {
    expect(presetBodyFits("x".repeat(16385))).toBe(false);
  });

  it("counts UTF-8 bytes, not characters", () => {
    // "é" is 2 bytes: 8192 of them is 16384 bytes, one more is 16386.
    expect(presetBodyFits("é".repeat(8192))).toBe(true);
    expect(presetBodyFits("é".repeat(8193))).toBe(false);
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
