import { describe, expect, it } from "vite-plus/test"
import { extractHeadingsFromBlocks, slugifyHeading } from "../src/docs/toc"

describe("cms-docs-toc", () => {
  it("slugifies titles into valid URL anchor slugs", () => {
    expect(slugifyHeading("Getting Started with Rimelight!")).toBe("getting-started-with-rimelight")
    expect(slugifyHeading("Section 1.2: Advanced Features")).toBe("section-12-advanced-features")
  })

  it("extracts nested section headings with correct depths and slugs", () => {
    const blocks: any[] = [
      {
        type: "SectionBlock",
        props: {
          title: "Introduction",
          level: 2,
          children: [
            {
              type: "SectionBlock",
              props: {
                title: "Core Concepts",
                level: 3,
                children: []
              }
            }
          ]
        }
      },
      {
        type: "SectionBlock",
        props: {
          title: "Configuration",
          level: 2,
          children: []
        }
      }
    ]

    const headings = extractHeadingsFromBlocks(blocks)
    expect(headings).toHaveLength(3)
    expect(headings[0]).toEqual({
      depth: 2,
      slug: "introduction",
      text: "Introduction"
    })
    expect(headings[1]).toEqual({
      depth: 3,
      slug: "core-concepts",
      text: "Core Concepts"
    })
    expect(headings[2]).toEqual({
      depth: 2,
      slug: "configuration",
      text: "Configuration"
    })
  })
})
