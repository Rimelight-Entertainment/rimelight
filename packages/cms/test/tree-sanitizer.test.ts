import { describe, expect, it } from "vite-plus/test"
import { sanitizeBlockTree } from "../src/client/utils/tree-sanitizer"
import type { BaseBlock } from "../src/core/types/blocks"

describe("sanitizeBlockTree", () => {
  it("removes top-level orphan blocks when they are nested inside a section", () => {
    const childBlock: BaseBlock = {
      id: "child-1",
      type: "ParagraphBlock",
      props: { text: "TEST" }
    }

    const sectionBlock: BaseBlock = {
      id: "section-1",
      type: "SectionBlock",
      children: [],
      props: {
        title: "New Section",
        children: [childBlock]
      }
    }

    const inputBlocks: BaseBlock[] = [sectionBlock, childBlock]

    const sanitized = sanitizeBlockTree(inputBlocks)

    expect(sanitized.length).toBe(1)
    expect(sanitized[0]?.id).toBe("section-1")
    expect(sanitized[0]?.props["children"]).toHaveLength(1)
    expect(sanitized[0]?.props["children"][0]?.id).toBe("child-1")
  })

  it("preserves non-orphaned top-level blocks and their children", () => {
    const childBlock: BaseBlock = {
      id: "child-1",
      type: "ParagraphBlock",
      props: { text: "Inside Section" }
    }

    const outsideBlock: BaseBlock = {
      id: "outside-1",
      type: "ParagraphBlock",
      props: { text: "Outside Section" }
    }

    const sectionBlock: BaseBlock = {
      id: "section-1",
      type: "SectionBlock",
      children: [],
      props: {
        title: "Section",
        children: [childBlock]
      }
    }

    const inputBlocks: BaseBlock[] = [sectionBlock, outsideBlock]

    const sanitized = sanitizeBlockTree(inputBlocks)

    expect(sanitized.length).toBe(2)
    expect(sanitized[0]?.id).toBe("section-1")
    expect(sanitized[0]?.props["children"][0]?.id).toBe("child-1")
    expect(sanitized[1]?.id).toBe("outside-1")
  })
})
