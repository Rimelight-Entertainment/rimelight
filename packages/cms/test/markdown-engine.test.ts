import { describe, expect, it } from "vite-plus/test"
import { blocksToMarkdown } from "../src/markdown/serializer"
import { markdownToBlocks } from "../src/markdown/parser"
import type { BaseBlock } from "../src/core/types/blocks"

describe("markdown-engine", () => {
  describe("blocksToMarkdown", () => {
    it("serializes sections, paragraphs, callouts, and code blocks to markdown", () => {
      const blocks: BaseBlock[] = [
        {
          id: "1",
          type: "SectionBlock",
          children: [
            {
              id: "2",
              type: "ParagraphBlock",
              props: {
                text: [
                  { type: "text", text: "Welcome to " },
                  { type: "text", text: "Rimelight", marks: ["bold"] },
                  { type: "text", text: "! Here is a " },
                  {
                    type: "link",
                    url: "https://example.com",
                    children: [{ type: "text", text: "link" }]
                  }
                ]
              }
            },
            {
              id: "3",
              type: "CalloutBlock",
              props: {
                variant: "warning",
                children: [
                  {
                    id: "4",
                    type: "ParagraphBlock",
                    props: { text: "Be careful with database migrations!" }
                  }
                ]
              }
            },
            {
              id: "5",
              type: "CodeBlock",
              props: {
                language: "typescript",
                code: "const x: number = 42;"
              }
            }
          ],
          props: {
            title: "Getting Started",
            level: 2,
            children: []
          }
        }
      ]

      const md = blocksToMarkdown(blocks)
      expect(md).toContain("## Getting Started")
      expect(md).toContain("Welcome to **Rimelight**! Here is a [link](https://example.com)")
      expect(md).toContain("> [!WARNING]")
      expect(md).toContain("> Be careful with database migrations!")
      expect(md).toContain("```typescript\nconst x: number = 42;\n```")
    })

    it("serializes tables into markdown tables", () => {
      const blocks: BaseBlock[] = [
        {
          id: "1",
          type: "TableBlock",
          props: {
            columns: [
              { key: "prop", header: "Property", align: "left" },
              { key: "type", header: "Type", align: "center" }
            ],
            rows: [{ prop: "title", type: "string" }]
          }
        }
      ]

      const md = blocksToMarkdown(blocks)
      expect(md).toContain("| Property | Type |")
      expect(md).toContain("| --- | :---: |")
      expect(md).toContain("| title | string |")
    })
  })

  describe("markdownToBlocks", () => {
    it("parses headings, paragraphs, formatted text, code fences, and tables", () => {
      const rawMd = `
# Overview

This is an **important** guide with \`code\` and [links](https://rimelight.com).

> [!NOTE]
> Keep this in mind.

\`\`\`typescript
const app = true;
\`\`\`

| Key | Description |
| --- | --- |
| id | Unique ID |
`

      const blocks = markdownToBlocks(rawMd)
      expect(blocks.length).toBeGreaterThan(0)

      const section = blocks.find((b) => b.type === "SectionBlock")
      expect(section).toBeDefined()
      expect(section?.props.title).toBe("Overview")

      const callout = section?.props.children?.find((b: any) => b.type === "CalloutBlock")
      expect(callout).toBeDefined()
      expect(callout?.props.variant).toBe("note")

      const code = section?.props.children?.find((b: any) => b.type === "CodeBlock")
      expect(code).toBeDefined()
      expect(code?.props.language).toBe("typescript")

      const table = section?.props.children?.find((b: any) => b.type === "TableBlock")
      expect(table).toBeDefined()
      expect(table?.props.columns).toHaveLength(2)
      expect(table?.props.rows).toHaveLength(1)
    })
  })
})
