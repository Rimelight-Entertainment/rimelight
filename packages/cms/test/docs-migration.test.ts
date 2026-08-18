import { describe, it, expect } from "vite-plus/test"
import { parseMarkdownWithFrontmatter, convertMarkdownDocToPageRecord } from "../src/migration"

describe("Docs Migration Utilities", () => {
  it("parses markdown with YAML frontmatter", () => {
    const raw = `---
title: Getting Started
description: Quickstart guide
editUrl: false
---

# Introduction

This is a test doc.
`
    const { frontmatter, body } = parseMarkdownWithFrontmatter(raw)
    expect(frontmatter.title).toBe("Getting Started")
    expect(frontmatter.description).toBe("Quickstart guide")
    expect(frontmatter.editUrl).toBe(false)
    expect(body).toContain("# Introduction")
    expect(body).toContain("This is a test doc.")
  })

  it("converts markdown doc to a database page record with AST blocks", () => {
    const raw = `---
title: Database Docs
description: D1 and Drizzle setup
---

## Setup

Run migration to setup database.

\`\`\`bash
pnpm run migrate-docs
\`\`\`
`
    const { frontmatter, body } = parseMarkdownWithFrontmatter(raw)
    const record = convertMarkdownDocToPageRecord({
      slug: "database",
      title: frontmatter.title,
      description: frontmatter.description,
      markdown: body,
      properties: { version: "v2.0.0", locale: "en" }
    })

    expect(record.slug).toBe("database")
    expect(record.type).toBe("doc")
    expect(record.title).toEqual({ en: "Database Docs" })
    expect(record.description).toEqual({ en: "D1 and Drizzle setup" })
    expect(record.postedAt).toBeInstanceOf(Date)
    expect(record.content.properties?.version).toBe("v2.0.0")
    expect(record.content.blocks.length).toBeGreaterThan(0)
  })
})
