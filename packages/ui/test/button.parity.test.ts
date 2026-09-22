import { describe, it, expect, vi } from "vite-plus/test"

vi.mock("virtual:rimelight/ui", () => ({
  default: {
    unstyled: false,
    components: { themes: {} },
    icons: {}
  }
}))

import RLSButton from "../src/components/button/RLSButton"
import { renderSolid } from "./utils/normalize"

describe("RLSButton Solid Component Rendering", () => {
  const variants = ["solid", "outline", "soft", "subtle", "ghost", "link"] as const
  const sizes = ["xs", "sm", "md", "lg", "xl"] as const

  it("renders default prop output correctly", () => {
    const solidHtml = renderSolid(RLSButton, { label: "Click Me" })
    expect(solidHtml).toContain("Click Me")
    expect(solidHtml).toContain("data-slot=")
  })

  it("renders button tag vs link tag when href is passed", () => {
    const solidBtn = renderSolid(RLSButton, { label: "Button" })
    expect(solidBtn).toContain("<button")

    const solidLink = renderSolid(RLSButton, { href: "https://example.com", label: "Link" })
    expect(solidLink).toContain("<a")
    expect(solidLink).toContain('href="https://example.com"')
  })

  describe("variants and size permutations", () => {
    for (const variant of variants) {
      for (const size of sizes) {
        it(`renders correctly for variant=${variant}, size=${size}`, () => {
          const props = { variant, size, label: "Action" }
          const solid = renderSolid(RLSButton, props)
          expect(solid).toContain("Action")
        })
      }
    }
  })

  describe("block, square, and loading states", () => {
    it("renders block=true", () => {
      const solid = renderSolid(RLSButton, { block: true, label: "Block" })
      expect(solid).toContain("Block")
      expect(solid).toContain("w-full")
    })

    it("renders square=true", () => {
      const solid = renderSolid(RLSButton, { square: true, leadingIcon: "i-lucide-check" })
      expect(solid).toContain("p-0")
    })

    it("renders loading=true", () => {
      const solid = renderSolid(RLSButton, { loading: true, label: "Saving" })
      expect(solid).toContain("Saving")
      expect(solid).toContain("animate-spin")
    })
  })
})
