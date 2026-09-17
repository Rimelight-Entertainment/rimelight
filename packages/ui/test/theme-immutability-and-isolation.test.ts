import { describe, expect, it } from "vite-plus/test"
import { createGenerator } from "unocss"
import rimelightUiPreset from "../src/preset"
import { normalizeModifier, formatShortcutKeys } from "../src/shortcuts"
import { atom } from "../src/stores"

describe("@rimelight/ui - Preset Architecture and Reactive State Isolation", () => {
  it("preset configures theme colors with canonical pointers", async () => {
    const uno = await createGenerator({ presets: [rimelightUiPreset()] })
    const theme = (uno as any).config.theme

    expect(theme.colors.neutral["950"]).toBe("var(--rl-neutral-950)")
    expect(theme.colors.primary.DEFAULT).toBe("var(--rl-primary-500)")
  })

  it("normalizes modifier strings across operating systems reliably", () => {
    expect(normalizeModifier("ctrl")).toBe("ctrl")
    expect(normalizeModifier("control")).toBe("ctrl")
    expect(normalizeModifier("cmd")).toBe("meta")
    expect(normalizeModifier("command")).toBe("meta")
    expect(normalizeModifier("opt")).toBe("alt")
    expect(normalizeModifier("option")).toBe("alt")
  })

  it("formats key combinations accurately", () => {
    const formatted = formatShortcutKeys("ctrl_alt_k")
    expect(formatted).toEqual(["Ctrl", "Alt", "K"])
  })

  it("atom store provides reactive isolation across instances", () => {
    const store1 = atom({ count: 0 })
    const store2 = atom({ count: 100 })

    store1.set({ count: 1 })
    expect(store1.get().count).toBe(1)
    expect(store2.get().count).toBe(100)
  })
})
