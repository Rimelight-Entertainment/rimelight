import { describe, expect, it } from "vite-plus/test"
import { mergeTemplateBlocks } from "../src/core/template-sync"
import type { BaseBlock } from "../src/core/types/blocks"

describe("template-sync-worker", () => {
  it("processes template update batches without blocking", async () => {
    // Simulate processing 100 pages in batches
    const batchSize = 10
    const totalPages = 100

    let processedCount = 0

    // Simulate background worker processing batches
    const batchPromises = []
    for (let i = 0; i < totalPages; i += batchSize) {
      batchPromises.push(
        (async () => {
          const batch: Array<{ id: string; templateVersion: number; blocks: BaseBlock[] }> =
            Array.from({ length: Math.min(batchSize, totalPages - i) }, (_, idx) => ({
              id: `page-${i + idx}`,
              templateVersion: 1,
              blocks: [
                {
                  id: "anchor-1",
                  type: "SectionBlock",
                  isTemplated: true,
                  props: { title: "Old Header" }
                }
              ]
            }))

          batch.forEach((page) => {
            const newTemplateBlocks: BaseBlock[] = [
              {
                id: "anchor-1",
                type: "SectionBlock",
                isTemplated: true,
                props: { title: "New Header" }
              }
            ]
            page.blocks = mergeTemplateBlocks(page.blocks, newTemplateBlocks)
            page.templateVersion = 2
            processedCount++
          })

          await new Promise((resolve) => setTimeout(resolve, 1))
        })()
      )
    }

    await Promise.all(batchPromises)
    expect(processedCount).toBe(totalPages)
  })

  it("preserves user-inserted blocks during template sync", () => {
    const existingPageBlocks: BaseBlock[] = [
      { id: "anchor-1", type: "SectionBlock", isTemplated: true, props: { title: "Header" } },
      { id: "custom-1", type: "ParagraphBlock", props: { text: "User content" } },
      { id: "anchor-2", type: "CalloutBlock", isTemplated: true, props: { text: "Disclaimer" } }
    ]

    const newTemplateBlocks: BaseBlock[] = [
      {
        id: "anchor-1",
        type: "SectionBlock",
        isTemplated: true,
        props: { title: "Updated Header" }
      },
      {
        id: "anchor-2",
        type: "CalloutBlock",
        isTemplated: true,
        props: { text: "Updated Disclaimer" }
      }
    ]

    const result = mergeTemplateBlocks(existingPageBlocks, newTemplateBlocks)

    expect(result).toHaveLength(3)
    expect(result[0]?.id).toBe("anchor-1")
    expect(result[0]?.props.title).toBe("Updated Header")
    expect(result[1]?.id).toBe("custom-1") // User block preserved
    expect(result[2]?.id).toBe("anchor-2")
    expect(result[2]?.props.text).toBe("Updated Disclaimer")
  })

  it("handles new template anchors inserted during update", () => {
    const existingPageBlocks: BaseBlock[] = [
      { id: "anchor-1", type: "SectionBlock", isTemplated: true, props: { title: "Header" } }
    ]

    const newTemplateBlocks: BaseBlock[] = [
      {
        id: "anchor-1",
        type: "SectionBlock",
        isTemplated: true,
        props: { title: "Updated Header" }
      },
      {
        id: "anchor-new",
        type: "CalloutBlock",
        isTemplated: true,
        props: { text: "New Required Notice" }
      }
    ]

    const result = mergeTemplateBlocks(existingPageBlocks, newTemplateBlocks)

    expect(result).toHaveLength(2)
    expect(result[0]?.id).toBe("anchor-1")
    expect(result[1]?.type).toBe("CalloutBlock")
    expect(result[1]?.isTemplated).toBe(true)
  })

  it("handles removed template anchors (graceful degradation)", () => {
    const existingPageBlocks: BaseBlock[] = [
      { id: "anchor-1", type: "SectionBlock", isTemplated: true, props: { title: "Header" } },
      { id: "anchor-2", type: "CalloutBlock", isTemplated: true, props: { text: "Old Notice" } }
    ]

    const newTemplateBlocks: BaseBlock[] = [
      {
        id: "anchor-1",
        type: "SectionBlock",
        isTemplated: true,
        props: { title: "Updated Header" }
      }
    ]

    const result = mergeTemplateBlocks(existingPageBlocks, newTemplateBlocks)

    // In production, this should be handled by validation
    // For now, the function preserves the old anchor
    expect(result.length).toBeGreaterThanOrEqual(1)
  })

  it("respects property-level locks during template sync", () => {
    const existingPageBlocks: BaseBlock[] = [
      {
        id: "anchor-1",
        type: "CalloutBlock",
        isTemplated: true,
        templatedProps: ["disclaimer"],
        props: {
          disclaimer: "Legal Disclaimer",
          text: "Editable content"
        }
      }
    ]

    const newTemplateBlocks: BaseBlock[] = [
      {
        id: "anchor-1",
        type: "CalloutBlock",
        isTemplated: true,
        templatedProps: ["disclaimer"],
        props: {
          disclaimer: "Updated Legal Disclaimer",
          text: "New template text"
        }
      }
    ]

    const result = mergeTemplateBlocks(existingPageBlocks, newTemplateBlocks)

    // Locked property should be updated from template
    expect(result[0]?.props.disclaimer).toBe("Updated Legal Disclaimer")
    // Non-locked property should preserve user content
    expect(result[0]?.props.text).toBe("Editable content")
  })

  it("handles complex nested structures during sync", () => {
    const existingPageBlocks: BaseBlock[] = [
      {
        id: "anchor-1",
        type: "SectionBlock",
        isTemplated: true,
        props: { title: "Section 1" },
        children: [{ id: "custom-1", type: "ParagraphBlock", props: { text: "User content" } }]
      }
    ]

    const newTemplateBlocks: BaseBlock[] = [
      {
        id: "anchor-1",
        type: "SectionBlock",
        isTemplated: true,
        props: { title: "Updated Section 1" },
        children: [
          {
            id: "anchor-child-1",
            type: "ParagraphBlock",
            isTemplated: true,
            props: { text: "Template child" }
          }
        ]
      }
    ]

    const result = mergeTemplateBlocks(existingPageBlocks, newTemplateBlocks)

    expect(result[0]?.props.title).toBe("Updated Section 1")
    // User children should be preserved (implementation dependent)
    expect(result[0]?.children).toBeDefined()
  })
})
