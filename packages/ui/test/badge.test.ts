import { describe, it, expect, vi } from "vite-plus/test"

vi.mock("virtual:rimelight/ui", () => ({
  default: {
    unstyled: false,
    components: { themes: {} },
    icons: {}
  }
}))

import { RLBadge } from "../src/components/badge/RLBadge"
import { renderSolid } from "./utils/normalize"

describe("RLBadge Solid Component Suite", () => {
  const variants = ["solid", "outline", "soft", "subtle", "ghost"] as const
  const sizes = ["xs", "sm", "md", "lg", "xl"] as const
  const shapes = ["square", "rounded", "pill"] as const
  const colors = ["primary", "secondary", "success", "info", "warning", "error", "neutral"] as const

  describe("Basic & Label Rendering", () => {
    it("renders default prop output with children correctly", () => {
      const solidHtml = renderSolid(RLBadge, {}, "Default Badge")
      expect(solidHtml).toContain("Default Badge")
      expect(solidHtml).toContain('data-slot="root"')
      expect(solidHtml).toContain("span")
    })

    it("renders label prop inside label slot span", () => {
      const solidHtml = renderSolid(RLBadge, { label: "Prop Label" })
      expect(solidHtml).toContain('data-slot="label"')
      expect(solidHtml).toContain("Prop Label")
    })

    it("supports numeric labels", () => {
      const solidHtml = renderSolid(RLBadge, { label: 42 })
      expect(solidHtml).toContain('data-slot="label"')
      expect(solidHtml).toContain("42")
    })

    it("renders polymorphic as prop correctly", () => {
      const solidHtml = renderSolid(RLBadge, { as: "div", label: "Div Badge" })
      expect(solidHtml).toContain("<div")
      expect(solidHtml).toContain('data-slot="root"')
      expect(solidHtml).toContain("Div Badge")
    })
  })

  describe("Variants, Colors, and Themes", () => {
    for (const variant of variants) {
      for (const color of colors) {
        it(`renders correctly for variant=${variant}, color=${color}`, () => {
          const props = { variant, color, size: "sm" as const }
          const solid = renderSolid(RLBadge, props, "Badge Text")
          expect(solid).toContain("Badge Text")
          expect(solid).toContain('data-slot="root"')
        })
      }
    }

    it("renders custom color classes using auto color variables", () => {
      const html = renderSolid(RLBadge, { color: "brand" as any, label: "Custom Color" })
      expect(html).toContain("rl-color-brand")
    })

    it("attaches data-theme when provided", () => {
      const html = renderSolid(RLBadge, { theme: "dark", label: "Themed" })
      expect(html).toContain('data-theme="dark"')
    })
  })

  describe("Size, Shape, and Square permutations", () => {
    for (const size of sizes) {
      for (const shape of shapes) {
        it(`renders correctly for size=${size}, shape=${shape}`, () => {
          const props = { size, shape }
          const solid = renderSolid(RLBadge, props, "Size Shape")
          expect(solid).toContain("Size Shape")
        })
      }
    }

    it("applies shape classes correctly without class collisions", () => {
      const htmlPill = renderSolid(RLBadge, { shape: "pill", label: "Pill" })
      expect(htmlPill).toContain("rounded-full")
      expect(htmlPill).not.toContain("rounded-none")

      const htmlSquare = renderSolid(RLBadge, { shape: "square", label: "Square" })
      expect(htmlSquare).toContain("rounded-none")
      expect(htmlSquare).not.toContain("rounded-full")

      const htmlRounded = renderSolid(RLBadge, { shape: "rounded", size: "md", label: "Rounded" })
      expect(htmlRounded).toContain("rounded-md")
    })

    it("applies square variant padding and min-width classes when square is true", () => {
      const htmlXs = renderSolid(RLBadge, { size: "xs", square: true, label: "1" })
      expect(htmlXs).toContain("p-0.5")
      expect(htmlXs).toContain("min-w-4")
      expect(htmlXs).toContain("justify-center")
      expect(htmlXs).not.toContain("px-1")

      const htmlMd = renderSolid(RLBadge, { size: "md", square: true, label: "2" })
      expect(htmlMd).toContain("p-1")
      expect(htmlMd).toContain("min-w-6")
      expect(htmlMd).toContain("justify-center")
      expect(htmlMd).not.toContain("px-2")
    })
  })

  describe("Icons and Avatars", () => {
    it("renders leading icon via icon prop by default", () => {
      const html = renderSolid(RLBadge, { icon: "rocket", label: "Featured" })
      expect(html).toContain('data-slot="leading-icon"')
      expect(html).toContain("<svg")
      expect(html).toContain("Featured")
    })

    it("renders leading icon via leadingIcon prop", () => {
      const html = renderSolid(RLBadge, { leadingIcon: "star", label: "Leading" })
      expect(html).toContain('data-slot="leading-icon"')
      expect(html).toContain("Leading")
    })

    it("renders trailing icon via trailingIcon prop", () => {
      const html = renderSolid(RLBadge, { trailingIcon: "arrow-right", label: "Next" })
      expect(html).toContain('data-slot="trailing-icon"')
      expect(html).toContain("<svg")
      expect(html).toContain("Next")
    })

    it("renders trailing icon via trailing-icon kebab prop", () => {
      const html = renderSolid(RLBadge, { "trailing-icon": "arrow-right", "label": "Next" } as any)
      expect(html).toContain('data-slot="trailing-icon"')
      expect(html).toContain("<svg")
      expect(html).toContain("Next")
    })

    it("renders both leading and trailing icons simultaneously", () => {
      const html = renderSolid(RLBadge, { icon: "star", trailingIcon: "check", label: "Both" })
      expect(html).toContain('data-slot="leading-icon"')
      expect(html).toContain('data-slot="trailing-icon"')
      expect(html).toContain("Both")
    })

    it("renders icon as trailing when trailing=true", () => {
      const html = renderSolid(RLBadge, { icon: "arrow-right", trailing: true, label: "Continue" })
      expect(html).toContain('data-slot="trailing-icon"')
      expect(html).not.toContain('data-slot="leading-icon"')
    })

    it("renders avatar when avatar string is provided", () => {
      const html = renderSolid(RLBadge, {
        avatar: "https://github.com/nuxt.png",
        label: "Nuxt"
      })
      expect(html).toContain('data-slot="leading-avatar"')
      expect(html).toContain("Nuxt")
    })

    it("renders avatar when avatar object is provided", () => {
      const html = renderSolid(RLBadge, {
        avatar: { src: "https://github.com/nuxt.png", alt: "Nuxt Logo" },
        label: "Nuxt"
      })
      expect(html).toContain('data-slot="leading-avatar"')
      expect(html).toContain('alt="Nuxt Logo"')
    })
  })

  describe("FieldGroup & UI Overrides", () => {
    it("renders horizontal fieldGroup classes", () => {
      const html = renderSolid(RLBadge, { fieldGroup: "horizontal", label: "Grouped" })
      expect(html).toContain("not-only:first:rounded-e-none")
    })

    it("renders vertical fieldGroup classes", () => {
      const html = renderSolid(RLBadge, { fieldGroup: "vertical", label: "Grouped" })
      expect(html).toContain("not-only:first:rounded-b-none")
    })

    it("applies class and ui slot overrides cleanly", () => {
      const html = renderSolid(RLBadge, {
        class: "my-custom-badge",
        ui: {
          root: "custom-root-class",
          label: "custom-label-class"
        },
        label: "Custom UI"
      })
      expect(html).toContain("my-custom-badge")
      expect(html).toContain("custom-root-class")
      expect(html).toContain("custom-label-class")
    })

    it("supports ui.base alias for root slot override", () => {
      const html = renderSolid(RLBadge, {
        ui: {
          base: "base-slot-override"
        },
        label: "Base Override"
      })
      expect(html).toContain("base-slot-override")
    })
  })

  describe("Accessibility & WAI-ARIA", () => {
    it("forwards aria attributes to the root element", () => {
      const html = renderSolid(RLBadge, {
        "aria-label": "Status Active",
        "role": "status",
        "label": "Active"
      })
      expect(html).toContain('aria-label="Status Active"')
      expect(html).toContain('role="status"')
    })

    it("sets aria-hidden on decorative icons", () => {
      const html = renderSolid(RLBadge, {
        icon: "star",
        trailingIcon: "arrow-right",
        label: "Rated"
      })
      expect(html).toContain('aria-hidden="true"')
    })
  })
})
