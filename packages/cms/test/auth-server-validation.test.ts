import { describe, expect, it } from "vite-plus/test"
import { validateServerBlockPayload } from "../src/auth/editor-guards"
import type { BaseBlock } from "../src/core/types/blocks"

describe("validateServerBlockPayload", () => {
  it("rejects payload if a templated block was removed", () => {
    const existing: BaseBlock[] = [
      {
        id: "11111111-1111-4111-8111-111111111111",
        type: "SectionBlock",
        isTemplated: true,
        props: {}
      }
    ]
    const incoming: BaseBlock[] = []

    const result = validateServerBlockPayload(existing, incoming)
    expect(result.valid).toBe(false)
    expect(result.reason).toContain("templated blocks were removed")
  })

  it("rejects payload if locked templatedProps were modified", () => {
    const existing: BaseBlock[] = [
      {
        id: "11111111-1111-4111-8111-111111111111",
        type: "ParagraphBlock",
        isTemplated: true,
        templatedProps: true,
        props: { text: "Original" }
      }
    ]
    const incoming: BaseBlock[] = [
      {
        id: "11111111-1111-4111-8111-111111111111",
        type: "ParagraphBlock",
        isTemplated: true,
        templatedProps: true,
        props: { text: "Modified" }
      }
    ]

    const result = validateServerBlockPayload(existing, incoming)
    expect(result.valid).toBe(false)
    expect(result.reason).toContain("Cannot modify locked properties")
  })
})
