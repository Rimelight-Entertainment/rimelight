import { describe, it, expect, vi } from "vite-plus/test"

vi.mock("virtual:rimelight/ui", () => ({
  default: {
    unstyled: false,
    components: { themes: {} },
    icons: {}
  }
}))

import RLSCard from "../src/components/card/RLSCard"
import { renderSolid } from "./utils/normalize"

describe("RLSCard Solid Component Rendering", () => {
  const variants = ["solid", "outline", "soft", "subtle"] as const

  it("renders default card structure and classes correctly", () => {
    const solid = renderSolid(
      RLSCard,
      { title: "Card Title", description: "Card Description" },
      "Card Body"
    )

    expect(solid).toContain("Card Title")
    expect(solid).toContain("Card Description")
    expect(solid).toContain("Card Body")
    expect(solid).toContain("data-slot=")
  })

  it("renders interactive link card structure correctly", () => {
    const solid = renderSolid(RLSCard, { href: "/details", title: "Link Card" })
    expect(solid).toContain("<a")
    expect(solid).toContain('href="/details"')
    expect(solid).toContain("Link Card")
  })

  describe("variants permutations", () => {
    for (const variant of variants) {
      it(`renders correctly for variant=${variant}`, () => {
        const props = { variant, title: "Title", description: "Desc" }
        const solid = renderSolid(RLSCard, props, "Content")
        expect(solid).toContain("Title")
        expect(solid).toContain("Content")
      })
    }
  })

  it("renders overlay card variant correctly", () => {
    const solid = renderSolid(RLSCard, {
      overlay: true,
      title: "Overlay Title",
      mediaSrc: "/test.jpg"
    })

    expect(solid).toContain("Overlay Title")
    expect(solid).toContain("/test.jpg")
  })
})
