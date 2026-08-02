import { describe, expect, it } from "vite-plus/test"
import { mergeTemplateBlocks } from "../src/core/template-sync"
import type { BaseBlock } from "../src/core/types/blocks"

describe("mergeTemplateBlocks", () => {
  it("fits structural template anchors while preserving user-inserted custom blocks", () => {
    const existingPageBlocks: BaseBlock[] = [
      { id: "anchor-1", type: "SectionBlock", isTemplated: true, props: { title: "Header" } },
      { id: "custom-1", type: "ParagraphBlock", props: { text: "User content" } }
    ]

    const newTemplateBlocks: BaseBlock[] = [
      {
        id: "anchor-1",
        type: "SectionBlock",
        isTemplated: true,
        props: { title: "Updated Header" }
      },
      { id: "anchor-2", type: "CalloutBlock", isTemplated: true, props: { text: "Disclaimer" } }
    ]

    const result = mergeTemplateBlocks(existingPageBlocks, newTemplateBlocks)

    expect(result).toHaveLength(3)
    expect(result[0]?.id).toBe("anchor-1")
    expect(result[1]?.id).toBe("custom-1")
    expect(result[2]?.type).toBe("CalloutBlock")
  })
})
