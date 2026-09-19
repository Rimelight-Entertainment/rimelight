import { describe, it, expect, vi } from "vite-plus/test"
import { normalizeModifier, formatShortcutKeys } from "../src/shortcuts"
import { atom } from "../src/stores"

describe("@rimelight/ui shortcuts and reactive state stores", () => {
  describe("normalizeModifier & formatShortcutKeys", () => {
    it("should normalize modifier aliases", () => {
      expect(normalizeModifier("cmd")).toBe("meta")
      expect(normalizeModifier("command")).toBe("meta")
      expect(normalizeModifier("control")).toBe("ctrl")
      expect(normalizeModifier("opt")).toBe("alt")
      expect(normalizeModifier("option")).toBe("alt")
      expect(normalizeModifier("shift")).toBe("shift")
    })

    it("should format shortcut strings into human-readable keys", () => {
      const keys = formatShortcutKeys("meta_shift_k")
      expect(keys).toContain("Shift")
      expect(keys).toContain("K")
    })
  })

  describe("reactive stores", () => {
    it("should create, update, and subscribe to atom store", () => {
      const state = atom({ theme: "dark", active: true })
      const fn = vi.fn()
      const unbind = state.subscribe(fn)

      expect(fn).toHaveBeenCalledWith({ theme: "dark", active: true })
      state.set({ theme: "light", active: false })
      expect(fn).toHaveBeenCalledWith({ theme: "light", active: false })
      expect(state.get()).toEqual({ theme: "light", active: false })
      unbind()
    })
  })
})
