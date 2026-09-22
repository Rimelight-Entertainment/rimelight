import { describe, it, expect, vi } from "vite-plus/test"

vi.mock("virtual:rimelight/ui", () => ({
  default: {
    unstyled: false,
    components: { themes: {} },
    icons: {}
  }
}))

import RLSBadge from "../src/components/badge/RLSBadge"
import { renderSolid } from "./utils/normalize"

describe("RLSBadge Solid Component Rendering", () => {
  const variants = ["solid", "outline", "soft", "subtle"] as const
  const sizes = ["xs", "sm", "md", "lg", "xl"] as const
  const shapes = ["square", "rounded", "pill"] as const

  it("renders default prop output correctly", () => {
    const solidHtml = renderSolid(RLSBadge, {}, "Default Badge")
    expect(solidHtml).toContain("Default Badge")
    expect(solidHtml).toContain("data-slot=")
  })

  it("renders label prop fallback correctly", () => {
    const solidHtml = renderSolid(RLSBadge, { label: "Prop Label" })
    expect(solidHtml).toContain("Prop Label")
  })

  describe("variants and color permutations", () => {
    for (const variant of variants) {
      for (const color of ["primary", "neutral"] as const) {
        it(`renders correctly for variant=${variant}, color=${color}`, () => {
          const props = { variant, color, size: "sm" as const }
          const solid = renderSolid(RLSBadge, props, "Badge Text")
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
          const solid = renderSolid(RLSBadge, props, "Size Shape")
          expect(solid).toContain("Size Shape")
        })
      }
    }
  })
})
