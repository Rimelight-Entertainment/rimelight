import { describe, it, expect, vi } from "vite-plus/test"

vi.mock("virtual:rimelight/ui", () => ({
  default: {
    unstyled: false,
    components: { themes: {} },
    icons: {}
  }
}))

import RLBadge from "../src/components/badge/RLBadge"
import { renderSolid } from "./utils/normalize"

describe("RLBadge Solid Component Rendering", () => {
  const variants = ["solid", "outline", "soft", "subtle"] as const
  const sizes = ["xs", "sm", "md", "lg", "xl"] as const
  const shapes = ["square", "rounded", "pill"] as const

  it("renders default prop output correctly", () => {
    const solidHtml = renderSolid(RLBadge, {}, "Default Badge")
    expect(solidHtml).toContain("Default Badge")
    expect(solidHtml).toContain("data-slot=")
  })

  it("renders label prop fallback correctly", () => {
    const solidHtml = renderSolid(RLBadge, { label: "Prop Label" })
    expect(solidHtml).toContain("Prop Label")
  })

  describe("variants and color permutations", () => {
    for (const variant of variants) {
      for (const color of ["primary", "neutral"] as const) {
        it(`renders correctly for variant=${variant}, color=${color}`, () => {
          const props = { variant, color, size: "sm" as const }
          const solid = renderSolid(RLBadge, props, "Badge Text")
          expect(solid).toContain("Badge Text")
        })
      }
    }
  })

  describe("size and shape permutations", () => {
    for (const size of sizes) {
      for (const shape of shapes) {
        it(`renders correctly for size=${size}, shape=${shape}`, () => {
          const props = { size, shape }
          const solid = renderSolid(RLBadge, props, "Size Shape")
          expect(solid).toContain("Size Shape")
        })
      }
    }
  })
})
