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
import { resolveIcon, DEFAULT_ICONS } from "../src/icons"

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

  it("should resolve built-in default icons", () => {
    const icon = resolveIcon("check")
    expect(icon.isClass).toBe(false)
    expect(icon.content).toBe(DEFAULT_ICONS.check)
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

  it("should support property access and enumeration on lazy DEFAULT_ICONS proxy", () => {
    expect(DEFAULT_ICONS.arrowLeft).toContain("<svg")
    expect("arrowRight" in DEFAULT_ICONS).toBe(true)
    expect(Object.keys(DEFAULT_ICONS).length).toBeGreaterThan(30)
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
    expect(css).toContain("var(--colors-neutral-600)")
    expect(css).toContain("var(--colors-neutral-100)")
    expect(css).toContain("var(--colors-neutral-300)")
    expect(css).toContain("var(--colors-neutral-400)")
    expect(css).toContain("var(--colors-neutral-950)")
    expect(css).toContain("var(--colors-neutral-50)")
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
})
