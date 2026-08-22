import { describe, it, expect, vi } from "vite-plus/test"

vi.mock("virtual:rimelight/ui", () => ({
  default: {
    unstyled: false,
    components: {
      themes: {
        testOverride: {
          base: { label: "overridden-label" },
          variants: {
            size: { sm: { root: "override-sm" } }
          }
        }
      }
    },
    icons: {
      customIcon: "i-custom-icon"
    }
  }
}))

import { defineTheme } from "../src/resolver"
import { resolveIcon } from "../src/icons"

describe("@rimelight/ui core resolver", () => {
  it("should merge slots and variants correctly", () => {
    const baseTheme = {
      slots: ["root", "label", "icon"],
      base: {
        root: "flex items-center",
        label: "text-sm",
        icon: "size-4"
      },
      variants: {
        variant: {
          solid: { root: "bg-blue-500 text-white" },
          outline: { root: "border border-blue-500" }
        },
        size: {
          sm: { root: "p-2", label: "text-xs" },
          md: { root: "p-4", label: "text-base" }
        }
      },
      defaultVariants: {
        variant: "solid",
        size: "md"
      }
    }

    const themeFn = defineTheme("testComponent", baseTheme)
    const slots = themeFn({ size: "sm", class: "custom-root", ui: { label: "font-bold" } })

    expect(slots.root).toContain("flex items-center")
    expect(slots.root).toContain("bg-blue-500")
    expect(slots.root).toContain("p-2")
    expect(slots.root).toContain("custom-root")
    expect(slots.label).toContain("text-xs")
    expect(slots.label).toContain("font-bold")
    expect(slots.icon).toBe("size-4")
  })

  it("should deep merge custom overrides without losing base slots", () => {
    const baseTheme = {
      slots: ["root", "label", "icon"],
      base: {
        root: "flex items-center",
        label: "text-sm",
        icon: "size-4"
      },
      variants: {
        size: {
          sm: { root: "p-2", label: "text-xs" },
          md: { root: "p-4", label: "text-base" }
        }
      }
    }

    const themeFn = defineTheme("testOverride", baseTheme)
    const slots = themeFn({ size: "sm" })

    // slot 'icon' should not be lost even though testOverride only defined 'label'
    expect(slots.icon).toBe("size-4")
    // base.root should still be present
    expect(slots.root).toContain("flex items-center")
    // overridden variant and base slot should apply
    expect(slots.root).toContain("override-sm")
    expect(slots.label).toContain("overridden-label")
  })
})

describe("@rimelight/ui core icon resolution", () => {
  it("should resolve class-based icons", () => {
    const icon = resolveIcon("i-lucide-check")
    expect(icon.isClass).toBe(true)
    expect(icon.content).toBe("i-lucide-check")
  })

  it("should resolve built-in collection icons", () => {
    const icon = resolveIcon("i-rl-check")
    expect(icon.isClass).toBe(true)
    expect(icon.content).toBe("i-rl-check")
  })

  it("should resolve custom raw SVG icons", () => {
    const rawSvg = '<svg><path d="M0 0"/></svg>'
    const icon = resolveIcon("customSvg", rawSvg)
    expect(icon.isClass).toBe(false)
    expect(icon.content).toBe(rawSvg)
  })

  it("should resolve custom icon configured in uiConfig", () => {
    const icon = resolveIcon("customIcon")
    expect(icon.isClass).toBe(true)
    expect(icon.content).toBe("i-custom-icon")
  })

  it("should return empty icon for empty name and custom", () => {
    const icon = resolveIcon("")
    expect(icon.isClass).toBe(false)
    expect(icon.content).toBe("")
  })

  it("should match compound variants when color is auto", () => {
    const baseTheme = {
      slots: ["root"],
      base: { root: "btn" },
      variants: {
        color: "auto",
        variant: {
          solid: { root: "btn-solid" }
        }
      },
      compoundVariants: [
        {
          color: "neutral",
          variant: "solid",
          classNames: { root: "btn-neutral-solid" }
        }
      ],
      defaultVariants: {
        color: "primary",
        variant: "solid"
      }
    }

    const themeFn = defineTheme("testAutoColor", baseTheme)
    const primarySlots = themeFn({ color: "primary" })
    expect(primarySlots.root).toContain("rl-color-primary")
    expect(primarySlots.root).toContain("btn-solid")
    expect(primarySlots.root).not.toContain("btn-neutral-solid")

    const neutralSlots = themeFn({ color: "neutral" })
    expect(neutralSlots.root).toContain("rl-color-neutral")
    expect(neutralSlots.root).toContain("btn-neutral-solid")
  })
})

describe("@rimelight/ui preset intent shortcuts", () => {
  it("should expand intent shortcuts properly via UnoCSS", async () => {
    const { createGenerator } = await import("unocss")
    const rimelightUiPreset = (await import("../src/preset")).default
    const uno = await createGenerator({
      presets: [rimelightUiPreset()]
    })

    const { css } = await uno.generate(
      "text-muted bg-elevated border-accented ring-dimmed bg-inverted text-muted/50"
    )
    expect(css).toContain("var(--color-neutral-600)")
    expect(css).toContain("var(--color-neutral-100)")
    expect(css).toContain("var(--color-neutral-300)")
    expect(css).toContain("var(--color-neutral-400)")
    expect(css).toContain("var(--color-neutral-950)")
    expect(css).toContain("var(--color-neutral-50)")
    expect(css).toContain(".text-muted\\/50")
  })
})

describe("@rimelight/ui shortcuts system", () => {
  it("should format shortcut keys correctly", async () => {
    const { formatShortcutKeys } = await import("../src/shortcuts")
    expect(formatShortcutKeys("meta_k")).toEqual([expect.any(String), "K"])
    expect(formatShortcutKeys("ctrl_alt_delete")).toEqual(["Ctrl", "Alt", "⌦"])
    expect(formatShortcutKeys("g-d")).toEqual(["G", "D"])
  })

  it("should register shortcuts into activeShortcutsStore before listeners subscribe", async () => {
    const origWindow = (globalThis as any).window
    ;(globalThis as any).window = { addEventListener: () => {}, removeEventListener: () => {} }
    try {
      const { defineShortcuts, activeShortcutsStore } = await import("../src/shortcuts")
      const cleanup = defineShortcuts({
        meta_k: {
          handler: () => {},
          label: "Open Search",
          category: "navigation"
        }
      })

      const active = activeShortcutsStore.get()
      expect(active.some((s) => s.label === "Open Search")).toBe(true)
      cleanup()
      expect(activeShortcutsStore.get().some((s) => s.label === "Open Search")).toBe(false)
    } finally {
      ;(globalThis as any).window = origWindow
    }
  })

  it("should trigger multi-modifier shortcuts like meta_alt_t via Ctrl+Alt+T on Windows/Linux", async () => {
    let listener: ((e: any) => void) | null = null
    const origWindow = (globalThis as any).window
    ;(globalThis as any).window = {
      addEventListener: (_event: string, fn: any) => {
        listener = fn
      },
      removeEventListener: () => {
        listener = null
      }
    }

    try {
      const { defineShortcuts } = await import("../src/shortcuts")
      let triggered = false
      const cleanup = defineShortcuts({
        meta_alt_t: () => {
          triggered = true
        }
      })

      expect(listener).toBeDefined()
      // Simulate physical Ctrl + Alt + T on Windows/Linux (ctrlKey: true, altKey: true, metaKey: false)
      listener!({
        key: "t",
        code: "KeyT",
        ctrlKey: true,
        altKey: true,
        metaKey: false,
        shiftKey: false,
        preventDefault: () => {}
      })

      expect(triggered).toBe(true)
      cleanup()
    } finally {
      ;(globalThis as any).window = origWindow
    }
  })

  it("should resolve shortcuts using codeKey when Alt produces a special character", async () => {
    let listener: ((e: any) => void) | null = null
    const origWindow = (globalThis as any).window
    ;(globalThis as any).window = {
      addEventListener: (_event: string, fn: any) => {
        listener = fn
      },
      removeEventListener: () => {
        listener = null
      }
    }

    try {
      const { defineShortcuts } = await import("../src/shortcuts")
      let triggered = false
      const cleanup = defineShortcuts({
        meta_alt_t: () => {
          triggered = true
        }
      })

      expect(listener).toBeDefined()
      // On Mac or special layout, Alt+T produces '†' in e.key but 'KeyT' in e.code
      listener!({
        key: "†",
        code: "KeyT",
        ctrlKey: true,
        altKey: true,
        metaKey: false,
        shiftKey: false,
        preventDefault: () => {}
      })

      expect(triggered).toBe(true)
      cleanup()
    } finally {
      ;(globalThis as any).window = origWindow
    }
  })
})

describe("@rimelight/ui inlined cx", () => {
  it("should compose class names with cx", async () => {
    const { cx } = await import("../src/resolver")
    const isFalse = false
    expect(cx("a", isFalse && "b", null, undefined, ["c", ["d"]], { e: true, f: false })).toBe(
      "a c d e"
    )
  })
})

describe("@rimelight/ui unstyled mode", () => {
  it("should preserve props.class and props.ui overrides when unstyled", async () => {
    vi.mocked((await import("virtual:rimelight/ui")).default).unstyled = true
    const { defineTheme } = await import("../src/resolver")

    const themeFn = defineTheme("testUnstyled", {
      slots: ["root", "label"],
      base: { root: "base-root", label: "base-label" }
    })

    const slots = themeFn({ class: "custom-class", ui: { label: "custom-ui-label" } })
    expect(slots.root).toBe("custom-class")
    expect(slots.root).not.toContain("base-root")
    expect(slots.label).toBe("custom-ui-label")
    expect(slots.label).not.toContain("base-label")
  })
})
