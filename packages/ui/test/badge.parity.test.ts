import { describe, it, expect, vi } from "vite-plus/test"

vi.mock("virtual:rimelight/ui", () => ({
  default: {
    unstyled: false,
    components: { themes: {} },
    icons: {}
  }
}))

import RLSBadge from "../src/components/badge/RLSBadge"
import RLVBadge from "../src/components/badge/RLVBadge.vue"
import { renderSolid, renderVue, assertFrameworkParity } from "./utils/normalize"

describe("RLBadge Cross-Framework Parity", () => {
  const variants = ["solid", "outline", "soft", "subtle"] as const
  const sizes = ["xs", "sm", "md", "lg", "xl"] as const
  const shapes = ["square", "rounded", "pill"] as const

  it("matches default prop output across frameworks", async () => {
    const solidHtml = renderSolid(RLSBadge, {}, "Default Badge")
    const vueHtml = await renderVue(RLVBadge, {}, "Default Badge")

    assertFrameworkParity(solidHtml, vueHtml)
  })

  it("matches label prop fallback across frameworks", async () => {
    const solidHtml = renderSolid(RLSBadge, { label: "Prop Label" })
    const vueHtml = await renderVue(RLVBadge, { label: "Prop Label" })

    assertFrameworkParity(solidHtml, vueHtml)
    expect(solidHtml).toContain("Prop Label")
    expect(vueHtml).toContain("Prop Label")
  })

  describe("variants and color permutations", () => {
    for (const variant of variants) {
      for (const color of ["primary", "neutral"] as const) {
        it(`matches parity for variant=${variant}, color=${color}`, async () => {
          const props = { variant, color, size: "sm" as const }
          const solid = renderSolid(RLSBadge, props, "Badge Text")
          const vue = await renderVue(RLVBadge, props, "Badge Text")

          assertFrameworkParity(solid, vue)
        })
      }
    }
  })

  describe("size and shape permutations", () => {
    for (const size of sizes) {
      for (const shape of shapes) {
        it(`matches parity for size=${size}, shape=${shape}`, async () => {
          const props = { size, shape }
          const solid = renderSolid(RLSBadge, props, "Size Shape")
          const vue = await renderVue(RLVBadge, props, "Size Shape")

          assertFrameworkParity(solid, vue)
        })
      }
    }
  })
})
