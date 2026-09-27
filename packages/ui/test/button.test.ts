import { describe, it, expect, vi } from "vite-plus/test"

vi.mock("virtual:rimelight/ui", () => ({
  default: {
    unstyled: false,
    components: { themes: {} },
    icons: {}
  }
}))

import { RLButton } from "../src/components/button/RLButton"
import { renderSolid } from "./utils/normalize"

describe("RLButton Solid Component Rendering", () => {
  const variants = ["solid", "outline", "soft", "subtle", "ghost", "link"] as const
  const sizes = ["xs", "sm", "md", "lg", "xl"] as const

  it("renders default prop output correctly", () => {
    const solidHtml = renderSolid(RLButton, { label: "Click Me" })
    expect(solidHtml).toContain("Click Me")
    expect(solidHtml).toContain("data-slot=")
  })

  it("renders button tag vs link tag when href is passed", () => {
    const solidBtn = renderSolid(RLButton, { label: "Button" })
    expect(solidBtn).toContain("<button")

    const solidLink = renderSolid(RLButton, { href: "https://example.com", label: "Link" })
    expect(solidLink).toContain("<a")
    expect(solidLink).toContain('href="https://example.com"')
  })

  describe("variants and size permutations", () => {
    for (const variant of variants) {
      for (const size of sizes) {
        it(`renders correctly for variant=${variant}, size=${size}`, () => {
          const props = { variant, size, label: "Action" }
          const solid = renderSolid(RLButton, props)
          expect(solid).toContain("Action")
        })
      }
    }
  })

  describe("block, square, and loading states", () => {
    it("renders block=true", () => {
      const solid = renderSolid(RLButton, { block: true, label: "Block" })
      expect(solid).toContain("Block")
      expect(solid).toContain("w-full")
    })

    it("renders square=true", () => {
      const solid = renderSolid(RLButton, { square: true, leadingIcon: "i-lucide-check" })
      expect(solid).toContain("p-2")
      expect(solid).not.toContain("px-")
      expect(solid).not.toContain("py-")
    })

    it("renders loading=true", () => {
      const solid = renderSolid(RLButton, { loading: true, label: "Saving" })
      expect(solid).toContain("Saving")
      expect(solid).toContain("animate-spin")
    })
  })
})
