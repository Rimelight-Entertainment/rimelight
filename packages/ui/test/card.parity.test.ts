import { describe, it, expect, vi } from "vite-plus/test"

vi.mock("virtual:rimelight/ui", () => ({
  default: {
    unstyled: false,
    components: { themes: {} },
    icons: {}
  }
}))

import RLSCard from "../src/components/card/RLSCard"
import RLVCard from "../src/components/card/RLVCard.vue"
import { renderSolid, renderVue, assertFrameworkParity } from "./utils/normalize"

describe("RLCard Cross-Framework Parity", () => {
  const variants = ["solid", "outline", "soft", "subtle"] as const

  it("matches default card structure and classes", async () => {
    const solid = renderSolid(
      RLSCard,
      { title: "Card Title", description: "Card Description" },
      "Card Body"
    )
    const vue = await renderVue(
      RLVCard,
      { title: "Card Title", description: "Card Description" },
      "Card Body"
    )

    assertFrameworkParity(solid, vue)
    expect(solid).toContain("Card Title")
    expect(vue).toContain("Card Title")
  })

  it("matches interactive link card structure", async () => {
    const solid = renderSolid(RLSCard, { href: "/details", title: "Link Card" })
    const vue = await renderVue(RLVCard, { href: "/details", title: "Link Card" })

    assertFrameworkParity(solid, vue)
    expect(solid).toContain("<a")
    expect(vue).toContain("<a")
  })

  describe("variants permutations", () => {
    for (const variant of variants) {
      it(`matches parity for variant=${variant}`, async () => {
        const props = { variant, title: "Title", description: "Desc" }
        const solid = renderSolid(RLSCard, props, "Content")
        const vue = await renderVue(RLVCard, props, "Content")

        assertFrameworkParity(solid, vue)
      })
    }
  })

  it("matches overlay card variant", async () => {
    const solid = renderSolid(RLSCard, {
      overlay: true,
      title: "Overlay Title",
      mediaSrc: "/test.jpg"
    })
    const vue = await renderVue(RLVCard, {
      overlay: true,
      title: "Overlay Title",
      mediaSrc: "/test.jpg"
    })

    assertFrameworkParity(solid, vue)
  })
})
