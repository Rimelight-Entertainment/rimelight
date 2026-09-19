import { describe, it, expect } from "vite-plus/test"
import { defaultOgLayout, NOTO_SANS } from "./og"

describe("@rimelight/seo defaultOgLayout", () => {
  it("should construct default dark layout VNode with title and brand", () => {
    const vnode: any = defaultOgLayout({
      title: "My Amazing Blog Post",
      brand: "Rimelight",
      badge: "Blog",
      description: "A deep dive into testing and safety."
    })

    expect(vnode.type).toBe("div")
    expect(vnode.props.style.backgroundColor).toBe("#0a0a0a")
    expect(vnode.props.style.fontFamily).toBe(NOTO_SANS.name)
    expect(vnode.props.children).toHaveLength(3) // brand row, content row, footer row
  })

  it("should truncate overly long titles and descriptions safely", () => {
    const longTitle = "A".repeat(200)
    const longDesc = "B".repeat(300)

    const vnode: any = defaultOgLayout({
      title: longTitle,
      description: longDesc
    })

    const titleNode = vnode.props.children[1].props.children[0]
    const descNode = vnode.props.children[1].props.children[1]

    expect(titleNode.props.children.length).toBe(160)
    expect(titleNode.props.children.endsWith("\u2026")).toBe(true)
    expect(descNode.props.children.length).toBe(240)
    expect(descNode.props.children.endsWith("\u2026")).toBe(true)
  })

  it("should support gradient background and preview overlay", () => {
    const vnode: any = defaultOgLayout({
      title: "Preview Post",
      background: "gradient",
      preview: true
    })

    expect(vnode.props.style.background).toContain("linear-gradient")
    // Contains previewOverlay and previewLabel
    expect(vnode.props.children.some((c: any) => c?.props?.children === "PREVIEW")).toBe(true)
  })
})
