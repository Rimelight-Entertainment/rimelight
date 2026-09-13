import { describe, it, expect, vi } from "vite-plus/test"

vi.mock("virtual:rimelight/ui", () => ({
  default: {
    unstyled: false,
    components: { themes: {} },
    icons: {}
  }
}))

import RLSButton from "../src/components/button/RLSButton"
import RLVButton from "../src/components/button/RLVButton.vue"
import { renderSolid, renderVue, assertFrameworkParity } from "./utils/normalize"

describe("RLButton Cross-Framework Parity", () => {
  const variants = ["solid", "outline", "soft", "subtle", "ghost", "link"] as const
  const sizes = ["xs", "sm", "md", "lg", "xl"] as const

  it("matches default prop output across frameworks", async () => {
    const solidHtml = renderSolid(RLSButton, { label: "Click Me" })
    const vueHtml = await renderVue(RLVButton, { label: "Click Me" })

    assertFrameworkParity(solidHtml, vueHtml)
  })

  it("matches button tag vs link tag when href is passed", async () => {
    const solidBtn = renderSolid(RLSButton, { label: "Button" })
    const vueBtn = await renderVue(RLVButton, { label: "Button" })
    assertFrameworkParity(solidBtn, vueBtn)
    expect(solidBtn).toContain("<button")
    expect(vueBtn).toContain("<button")

    const solidLink = renderSolid(RLSButton, { href: "https://example.com", label: "Link" })
    const vueLink = await renderVue(RLVButton, { href: "https://example.com", label: "Link" })
    assertFrameworkParity(solidLink, vueLink)
    expect(solidLink).toContain("<a")
    expect(vueLink).toContain("<a")
  })

  describe("variants and size permutations", () => {
    for (const variant of variants) {
      for (const size of sizes) {
        it(`matches parity for variant=${variant}, size=${size}`, async () => {
          const props = { variant, size, label: "Action" }
          const solid = renderSolid(RLSButton, props)
          const vue = await renderVue(RLVButton, props)

          assertFrameworkParity(solid, vue)
        })
      }
    }
  })

  describe("block, square, and loading states", () => {
    it("matches block=true", async () => {
      const solid = renderSolid(RLSButton, { block: true, label: "Block" })
      const vue = await renderVue(RLVButton, { block: true, label: "Block" })
      assertFrameworkParity(solid, vue)
    })

    it("matches square=true", async () => {
      const solid = renderSolid(RLSButton, { square: true, leadingIcon: "i-lucide-check" })
      const vue = await renderVue(RLVButton, { square: true, leadingIcon: "i-lucide-check" })
      assertFrameworkParity(solid, vue)
    })

    it("matches loading=true", async () => {
      const solid = renderSolid(RLSButton, { loading: true, label: "Saving" })
      const vue = await renderVue(RLVButton, { loading: true, label: "Saving" })
      assertFrameworkParity(solid, vue)
    })
  })
})
