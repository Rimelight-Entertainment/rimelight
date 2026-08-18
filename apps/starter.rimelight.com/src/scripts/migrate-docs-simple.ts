import fs from "node:fs"
import path from "node:path"
import { db } from "../db/index.ts"
import { pages } from "../db/schema/index.ts"
import { eq, and } from "drizzle-orm"

// Accept DATABASE_URL from command line or environment
const databaseUrl = process.argv[2] || process.env.DATABASE_URL
if (databaseUrl) {
  process.env.DATABASE_URL = databaseUrl
}

// Simple markdown parser (copied from @rimelight/cms to avoid Astro dependencies)
function genId(): string {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2, 11)
}

type InlineNode =
  | { type: "text"; text: string; marks?: string[] }
  | { type: "link"; url: string; children: InlineNode[] }

type BaseBlock = {
  id: string
  type: string
  props: Record<string, any>
  children?: BaseBlock[]
}

type ListItemBlock = BaseBlock & {
  type: "ListItemBlock"
  props: {
    content: InlineNode[]
  }
}

function parseInlines(text: string): InlineNode[] {
  if (!text) return []

  const inlines: InlineNode[] = []
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = linkRegex.exec(text)) !== null) {
    const beforeText = text.substring(lastIndex, match.index)
    if (beforeText) {
      inlines.push(...parseFormattedText(beforeText))
    }

    const linkText = match[1] || ""
    const linkUrl = match[2] || ""

    inlines.push({
      type: "link",
      url: linkUrl,
      children: [{ type: "text", text: linkText }]
    })

    lastIndex = linkRegex.lastIndex
  }

  const remainingText = text.substring(lastIndex)
  if (remainingText) {
    inlines.push(...parseFormattedText(remainingText))
  }

  return inlines.length > 0 ? inlines : [{ type: "text", text }]
}

function parseFormattedText(str: string): InlineNode[] {
  if (!str) return []

  const result: InlineNode[] = []
  const tokenRegex = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|~~[^~]+~~)/g
  let lastIdx = 0
  let match: RegExpExecArray | null

  while ((match = tokenRegex.exec(str)) !== null) {
    const rawBefore = str.substring(lastIdx, match.index)
    if (rawBefore) {
      result.push({ type: "text", text: rawBefore })
    }

    const token = match[1] || ""
    if (token.startsWith("`") && token.endsWith("`")) {
      result.push({
        type: "text",
        text: token.slice(1, -1),
        marks: ["code"]
      })
    } else if (token.startsWith("**") && token.endsWith("**")) {
      result.push({
        type: "text",
        text: token.slice(2, -2),
        marks: ["bold"]
      })
    } else if (token.startsWith("*") && token.endsWith("*")) {
      result.push({
        type: "text",
        text: token.slice(1, -1),
        marks: ["italic"]
      })
    } else if (token.startsWith("~~") && token.endsWith("~~")) {
      result.push({
        type: "text",
        text: token.slice(2, -2),
        marks: ["strikethrough"]
      })
    }

    lastIdx = tokenRegex.lastIndex
  }

  const remaining = str.substring(lastIdx)
  if (remaining) {
    result.push({ type: "text", text: remaining })
  }

  return result
}

function markdownToBlocks(markdown: string): BaseBlock[] {
  if (!markdown) return []

  let cleanMd = markdown.trim()
  if (cleanMd.startsWith("---")) {
    const endFm = cleanMd.indexOf("---", 3)
    if (endFm !== -1) {
      cleanMd = cleanMd.substring(endFm + 3).trim()
    }
  }

  const rootBlocks: BaseBlock[] = []
  const sectionStack: { level: number; block: BaseBlock }[] = []

  const appendToCurrentScope = (block: BaseBlock) => {
    if (sectionStack.length > 0) {
      const topSection = sectionStack[sectionStack.length - 1]!.block
      if (!topSection.children) topSection.children = []
      if (!topSection.props.children) topSection.props.children = []
      topSection.children.push(block)
      topSection.props.children.push(block)
    } else {
      rootBlocks.push(block)
    }
  }

  const lines = cleanMd.split("\n")
  let i = 0

  while (i < lines.length) {
    const line = lines[i] || ""
    const trimmed = line.trim()

    if (!trimmed) {
      i++
      continue
    }

    // Code Block
    if (trimmed.startsWith("```")) {
      const lang = trimmed.slice(3).trim()
      const codeLines: string[] = []
      i++
      while (i < lines.length && !(lines[i] || "").trim().startsWith("```")) {
        codeLines.push(lines[i] || "")
        i++
      }
      i++
      appendToCurrentScope({
        id: genId(),
        type: "CodeBlock",
        props: {
          language: lang || "text",
          code: codeLines.join("\n"),
          caption: ""
        }
      })
      continue
    }

    // Headings
    const headingMatch = line.match(/^(#{1,6})\s(.*)$/)
    if (headingMatch) {
      const hashes = headingMatch[1] || ""
      const title = (headingMatch[2] || "").trim()
      const level = Math.min(6, Math.max(2, hashes.length))

      const newSection: BaseBlock = {
        id: genId(),
        type: "SectionBlock",
        children: [],
        props: {
          title,
          level,
          description: "",
          children: []
        }
      }

      while (sectionStack.length > 0 && sectionStack[sectionStack.length - 1]!.level >= level) {
        sectionStack.pop()
      }

      appendToCurrentScope(newSection)
      sectionStack.push({ level, block: newSection })
      i++
      continue
    }

    // Lists (bullet points and numbered lists)
    const listMatch = trimmed.match(/^(\s*)([-*+]|\d+\.)\s+(.*)$/)
    if (listMatch) {
      const indent = listMatch[1] || ""
      const marker = listMatch[2] || ""
      const content = (listMatch[3] || "").trim()

      const listItems: BaseBlock[] = []
      const isOrdered = /^\d+\./.test(marker)

      // Collect all consecutive list items
      while (i < lines.length) {
        const currentLine = lines[i] || ""
        const currentTrimmed = currentLine.trim()
        const currentMatch = currentTrimmed.match(/^(\s*)([-*+]|\d+\.)\s+(.*)$/)

        if (!currentMatch) break

        const currentIndent = currentMatch[1] || ""
        const currentMarker = currentMatch[2] || ""
        const currentContent = (currentMatch[3] || "").trim()

        // Check if same level (simplified)
        if (currentIndent !== indent && currentIndent.length > indent.length) {
          // Nested list - skip for now, could be handled recursively
          i++
          continue
        }

        if (currentIndent !== indent) break

        const inlines = parseInlines(currentContent)
        listItems.push({
          id: genId(),
          type: "ListItemBlock",
          props: {
            content: inlines
          }
        })

        i++
      }

      if (listItems.length > 0) {
        appendToCurrentScope({
          id: genId(),
          type: isOrdered ? "OrderedListBlock" : "UnorderedListBlock",
          props: {
            items: listItems
          },
          children: listItems
        })
      }
      continue
    }

    // Paragraph
    const paragraphLines: string[] = []
    while (
      i < lines.length &&
      (lines[i] || "").trim() &&
      !(lines[i] || "").trim().startsWith("```") &&
      !(lines[i] || "").trim().startsWith("#") &&
      !(lines[i] || "").trim().startsWith(">") &&
      !((lines[i] || "").trim().startsWith("|") && (lines[i] || "").trim().endsWith("|")) &&
      !/^(\s*)([-*+]|\d+\.)\s/.test((lines[i] || "").trim())
    ) {
      paragraphLines.push(lines[i] || "")
      i++
    }

    if (paragraphLines.length > 0) {
      const paragraphText = paragraphLines.join(" ").trim()
      const inlines = parseInlines(paragraphText)
      appendToCurrentScope({
        id: genId(),
        type: "ParagraphBlock",
        props: {
          text: inlines
        }
      })
    } else {
      i++
    }
  }

  return rootBlocks
}

function parseMarkdownWithFrontmatter(raw: string): {
  frontmatter: Record<string, any>
  body: string
} {
  const frontmatter: Record<string, any> = {}
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/)

  if (!match) {
    return { frontmatter, body: raw.trim() }
  }

  const yamlBlock = match[1] || ""
  const body = (match[2] || "").trim()

  const lines = yamlBlock.split(/\r?\n/)
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) continue
    const colonIndex = trimmed.indexOf(":")
    if (colonIndex !== -1) {
      const key = trimmed.slice(0, colonIndex).trim()
      let value: any = trimmed.slice(colonIndex + 1).trim()

      if (value === "true") value = true
      else if (value === "false") value = false
      else if (value === "null") value = null
      else if (!isNaN(Number(value)) && value !== "") value = Number(value)
      else if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1)
      }

      frontmatter[key] = value
    }
  }

  return { frontmatter, body }
}

export async function migrateDocs() {
  console.log(`[Docs Migration] Starting migration...`)
  console.log(`[Docs Migration] DATABASE_URL: ${process.env.DATABASE_URL ? "Set" : "Not set"}`)
  console.log(`[Docs Migration] Current directory: ${process.cwd()}`)

  const docsDir = path.resolve(process.cwd(), "src/content/docs")
  console.log(`[Docs Migration] Looking for docs at: ${docsDir}`)
  console.log(`[Docs Migration] Docs directory exists: ${fs.existsSync(docsDir)}`)

  if (!fs.existsSync(docsDir)) {
    console.log(`[Docs Migration] Docs directory not found at: ${docsDir}`)
    return
  }

  const files: string[] = []

  function scanDir(dir: string) {
    const entries = fs.readdirSync(dir, { withFileTypes: true })
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        scanDir(fullPath)
      } else if (entry.isFile() && (entry.name.endsWith(".md") || entry.name.endsWith(".mdx"))) {
        files.push(fullPath)
      }
    }
  }

  scanDir(docsDir)
  console.log(`[Docs Migration] Found ${files.length} doc files to migrate...`)

  let successCount = 0
  let errorCount = 0

  /* eslint-disable no-await-in-loop */
  for (const filePath of files) {
    const relPath = path.relative(docsDir, filePath).replace(/\\/g, "/")
    // relPath format: v1.0.0/en/getting-started.md or v2.0.0/en/index.mdx
    const parts = relPath.split("/")
    const version = parts[0]?.startsWith("v") ? parts[0] : undefined
    const locale = version ? parts[1] : parts[0]
    const docPathParts = version ? parts.slice(2) : parts.slice(1)
    const docFile = docPathParts.join("/").replace(/\.(md|mdx)$/, "")
    const docSlug = docFile === "index" || docFile === "" ? "index" : docFile

    const rawContent = fs.readFileSync(filePath, "utf-8")
    const { frontmatter, body } = parseMarkdownWithFrontmatter(rawContent)

    const title = frontmatter.title || docSlug
    const description = frontmatter.description || ""

    const properties: Record<string, any> = {
      ...frontmatter,
      version,
      locale: locale || "en"
    }

    // Determine target slugs to insert
    // e.g., if version is v2.0.0 (latest), we can store both 'v2.0.0/slug' and root 'slug' (or 'index')
    const slugsToCreate: string[] = []
    if (version) {
      slugsToCreate.push(docSlug === "index" ? `${version}/index` : `${version}/${docSlug}`)
      // If v2.0.0 is current default version, also ensure root slug exists
      if (version === "v2.0.0") {
        slugsToCreate.push(docSlug)
      }
    } else {
      slugsToCreate.push(docSlug)
    }

    for (const slug of slugsToCreate) {
      const blocks = markdownToBlocks(body)

      // Debug: log first block structure for index page
      if (slug === "index") {
        console.log(`[Migration Debug] First block for index:`, JSON.stringify(blocks[0], null, 2))
      }

      const pageRecord = {
        id: crypto.randomUUID(),
        slug,
        type: "doc" as const,
        title: { [locale || "en"]: title },
        description: { [locale || "en"]: description },
        tags: [],
        authorIds: [],
        postedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        content: {
          blocks,
          properties
        }
      }

      try {
        // Check if page already exists
        const existing = await db
          .select({ id: pages.id })
          .from(pages)
          .where(and(eq(pages.type, "doc"), eq(pages.slug, slug)))
          .limit(1)

        if (existing && existing.length > 0 && existing[0]) {
          await db
            .update(pages)
            .set({
              title: pageRecord.title,
              description: pageRecord.description,
              content: pageRecord.content,
              postedAt: pageRecord.postedAt,
              updatedAt: new Date()
            })
            .where(eq(pages.id, existing[0].id))
        } else {
          await db.insert(pages).values(pageRecord)
        }
        successCount++
        console.log(`[Docs Migration] Successfully migrated: ${slug}`)
      } catch (err: any) {
        errorCount++
        console.error(
          `[Docs Migration] Failed migrating slug "${slug}" from ${relPath}:`,
          err?.message || err
        )
      }
    }
  }

  console.log(`[Docs Migration] Completed. Success: ${successCount}, Errors: ${errorCount}`)
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]?.replace(/\\/g, "/")}`) {
  console.log(`[Docs Migration] Script loaded, starting execution...`)
  migrateDocs()
    .then(() => {
      console.log(`[Docs Migration] Completed successfully`)
      process.exit(0)
    })
    .catch((err) => {
      console.error(`[Docs Migration] Error:`, err)
      process.exit(1)
    })
}
