import { describe, expect, it } from "vite-plus/test"
import { validateServerBlockPayload } from "../src/auth/editor-guards"
import type { BaseBlock } from "../src/core/types/blocks"

describe("templated-blocks", () => {
  it("rejects deletion of isTemplated blocks", () => {
    const existing: BaseBlock[] = [
      {
        id: "11111111-1111-4111-8111-111111111111",
        type: "SectionBlock",
        isTemplated: true,
        props: { title: "Header" }
      }
    ]
    const incoming: BaseBlock[] = []

    const result = validateServerBlockPayload(existing, incoming)
    expect(result.valid).toBe(false)
    expect(result.reason).toContain("templated blocks were removed")
  })

  it("rejects reordering of isTemplated blocks", () => {
    const existing: BaseBlock[] = [
      {
        id: "11111111-1111-4111-8111-111111111111",
        type: "SectionBlock",
        isTemplated: true,
        props: { title: "First" }
      },
      {
        id: "22222222-2222-4222-8222-222222222222",
        type: "SectionBlock",
        isTemplated: true,
        props: { title: "Second" }
      }
    ]
    const incoming: BaseBlock[] = [
      {
        id: "22222222-2222-4222-8222-222222222222",
        type: "SectionBlock",
        isTemplated: true,
        props: { title: "Second" }
      },
      {
        id: "11111111-1111-4111-8111-111111111111",
        type: "SectionBlock",
        isTemplated: true,
        props: { title: "First" }
      }
    ]

    const result = validateServerBlockPayload(existing, incoming)
    expect(result.valid).toBe(false)
  })

  it("rejects mutation when templatedProps is true (all props locked)", () => {
    const existing: BaseBlock[] = [
      {
        id: "11111111-1111-4111-8111-111111111111",
        type: "ParagraphBlock",
        isTemplated: true,
        templatedProps: true,
        props: { text: "Original text" }
      }
    ]
    const incoming: BaseBlock[] = [
      {
        id: "11111111-1111-4111-8111-111111111111",
        type: "ParagraphBlock",
        isTemplated: true,
        templatedProps: true,
        props: { text: "Modified text" }
      }
    ]

    const result = validateServerBlockPayload(existing, incoming)
    expect(result.valid).toBe(false)
    expect(result.reason).toContain("Cannot modify locked properties")
  })

  it("rejects mutation of specific locked props in templatedProps array", () => {
    const existing: BaseBlock[] = [
      {
        id: "11111111-1111-4111-8111-111111111111",
        type: "CalloutBlock",
        isTemplated: true,
        templatedProps: ["disclaimer"],
        props: { 
          disclaimer: "Official disclaimer",
          text: "Editable text"
        }
      }
    ]
    const incoming: BaseBlock[] = [
      {
        id: "11111111-1111-4111-8111-111111111111",
        type: "CalloutBlock",
        isTemplated: true,
        templatedProps: ["disclaimer"],
        props: { 
          disclaimer: "Modified disclaimer",
          text: "Editable text"
        }
      }
    ]

    const result = validateServerBlockPayload(existing, incoming)
    expect(result.valid).toBe(false)
    expect(result.reason).toContain("Cannot modify locked property 'disclaimer'")
  })

  it("allows mutation of non-locked props when templatedProps is array", () => {
    const existing: BaseBlock[] = [
      {
        id: "11111111-1111-4111-8111-111111111111",
        type: "CalloutBlock",
        isTemplated: true,
        templatedProps: ["disclaimer"],
        props: { 
          disclaimer: "Official disclaimer",
          text: "Original text"
        }
      }
    ]
    const incoming: BaseBlock[] = [
      {
        id: "11111111-1111-4111-8111-111111111111",
        type: "CalloutBlock",
        isTemplated: true,
        templatedProps: ["disclaimer"],
        props: { 
          disclaimer: "Official disclaimer",
          text: "Modified text"
        }
      }
    ]

    const result = validateServerBlockPayload(existing, incoming)
    expect(result.valid).toBe(true)
  })

  it("allows insertion of custom blocks around templated blocks", () => {
    const existing: BaseBlock[] = [
      {
        id: "11111111-1111-4111-8111-111111111111",
        type: "SectionBlock",
        isTemplated: true,
        props: { title: "Header" }
      }
    ]
    const incoming: BaseBlock[] = [
      {
        id: "99999999-9999-4999-8999-999999999999",
        type: "ParagraphBlock",
        props: { text: "Custom intro" }
      },
      {
        id: "11111111-1111-4111-8111-111111111111",
        type: "SectionBlock",
        isTemplated: true,
        props: { title: "Header" }
      },
      {
        id: "88888888-8888-4888-8888-888888888888",
        type: "ParagraphBlock",
        props: { text: "Custom outro" }
      }
    ]

    const result = validateServerBlockPayload(existing, incoming)
    expect(result.valid).toBe(true)
  })

  it("allows mutation of non-templated blocks", () => {
    const existing: BaseBlock[] = [
      {
        id: "11111111-1111-4111-8111-111111111111",
        type: "ParagraphBlock",
        props: { text: "Original" }
      }
    ]
    const incoming: BaseBlock[] = [
      {
        id: "11111111-1111-4111-8111-111111111111",
        type: "ParagraphBlock",
        props: { text: "Modified" }
      }
    ]

    const result = validateServerBlockPayload(existing, incoming)
    expect(result.valid).toBe(true)
  })
})