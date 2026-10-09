import { describe, expect, it } from "vite-plus/test";
import { createGenerator } from "unocss";
import { createStore } from "solid-js";
import { rimelightUiPreset } from "../src/preset";
import { normalizeModifier, formatShortcutKeys } from "../src/shortcuts";

describe("@rimelight/ui - Preset Architecture and Reactive State Isolation", () => {
  it("preset configures theme colors with canonical pointers", async () => {
    const uno = await createGenerator({ presets: [rimelightUiPreset()] });
    const theme = (uno as any).config.theme;

    expect(theme.colors.neutral["950"]).toBe("var(--rl-neutral-950)");
    expect(theme.colors.primary.DEFAULT).toBe("var(--rl-primary-500)");
  });

  it("normalizes modifier strings across operating systems reliably", () => {
    expect(normalizeModifier("ctrl")).toBe("ctrl");
    expect(normalizeModifier("control")).toBe("ctrl");
    expect(normalizeModifier("cmd")).toBe("meta");
    expect(normalizeModifier("command")).toBe("meta");
    expect(normalizeModifier("opt")).toBe("alt");
    expect(normalizeModifier("option")).toBe("alt");
  });

  it("formats key combinations accurately", () => {
    const formatted = formatShortcutKeys("ctrl_alt_k");
    expect(formatted).toEqual(["Ctrl", "Alt", "K"]);
  });

  it("solid stores provide reactive isolation across instances", () => {
    const [store1, setStore1] = createStore({ count: 0 });
    const [store2] = createStore({ count: 100 });

    setStore1((s) => ({ ...s, count: 1 }));
    expect(store1.count).toBe(1);
    expect(store2.count).toBe(100);
  });
});
