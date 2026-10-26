import { describe, expect, it } from "vite-plus/test";
import {
  byteLength,
  mergeTitleSettings,
  titleSettingsPatchSchema,
} from "../src/api/routes/v1/title-settings";

describe("titleSettingsPatchSchema", () => {
  it("accepts a two-level document of scalars", () => {
    const ok = titleSettingsPatchSchema.safeParse({
      audio: { masterVolume: 0.8, muted: false, label: "x", unset: null },
    });
    expect(ok.success).toBe(true);
  });

  it.each([
    ["non-object body", "nope"],
    ["three levels deep", { a: { b: { c: 1 } } }],
    ["invalid category name", { Audio: { masterVolume: 1 } }],
    ["invalid key name", { audio: { "master-volume": 1 } }],
    ["object value", { audio: { nested: { x: 1 } } }],
    ["array value", { audio: { list: [1, 2] } }],
    ["non-finite number", { audio: { v: Number.POSITIVE_INFINITY } }],
    ["string over 256 chars", { audio: { s: "a".repeat(257) } }],
  ])("rejects %s", (_label, body) => {
    expect(titleSettingsPatchSchema.safeParse(body).success).toBe(false);
  });
});

describe("mergeTitleSettings", () => {
  it("touches only the sent keys", () => {
    const merged = mergeTitleSettings(
      { audio: { masterVolume: 0.5, musicVolume: 0.5 }, video: { vsync: true } },
      { audio: { masterVolume: 0.8 } },
    );
    expect(merged).toEqual({
      audio: { masterVolume: 0.8, musicVolume: 0.5 },
      video: { vsync: true },
    });
  });

  it("removes a key on null and drops an emptied category", () => {
    const merged = mergeTitleSettings(
      { controls: { invertY: true } },
      { controls: { invertY: null } },
    );
    expect(merged).toEqual({});
  });

  it("does not mutate the input document", () => {
    const current = { audio: { masterVolume: 0.5 } };
    mergeTitleSettings(current, { audio: { masterVolume: 0.9 } });
    expect(current).toEqual({ audio: { masterVolume: 0.5 } });
  });
});

describe("byteLength", () => {
  it("counts UTF-8 bytes of the serialized document", () => {
    expect(byteLength({ a: "é" })).toBe(new TextEncoder().encode('{"a":"é"}').length);
  });
});
