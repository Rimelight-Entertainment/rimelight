import { sql } from "drizzle-orm"
import { markdownToBlocks } from "./markdown/parser.ts"
import type { BaseBlock } from "./core/types/blocks"

export interface DocMigrationInput {
  slug: string
  title: string | Record<string, string>
  description?: string | Record<string, string>
  markdown: string
  properties?: Record<string, any>
  postedAt?: Date | null
  authorIds?: string[]
}

export function parseMarkdownWithFrontmatter(raw: string): {
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

export function convertMarkdownDocToPageRecord(input: DocMigrationInput) {
  const blocks: BaseBlock[] = markdownToBlocks(input.markdown)
  const titleObj =
    typeof input.title === "string" ? { en: input.title } : input.title || { en: input.slug }
  const descObj =
    typeof input.description === "string"
      ? { en: input.description }
      : input.description || undefined

  return {
    id: crypto.randomUUID(),
    slug: input.slug,
    type: "doc" as const,
    title: titleObj,
    description: descObj,
    tags: [],
    authorIds: input.authorIds || [],
    postedAt: input.postedAt !== undefined ? input.postedAt : new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    content: {
      blocks,
      properties: input.properties || {}
    }
  }
}

export async function migrateLegacyPagesToCMSv2(db: any) {
  console.log("[Migration] Applying DDL schema updates...")

  await db.execute(sql`
    ALTER TABLE pages ADD COLUMN IF NOT EXISTS template_id UUID;
    ALTER TABLE pages ADD COLUMN IF NOT EXISTS template_version INTEGER DEFAULT 1 NOT NULL;
    ALTER TABLE page_versions ADD COLUMN IF NOT EXISTS version_number INTEGER DEFAULT 1 NOT NULL;

    CREATE UNIQUE INDEX IF NOT EXISTS page_versions_page_id_version_idx
    ON page_versions (page_id, version_number);
  `)

  console.log("[Migration] Transforming legacy page content in chunked batches...")

  const BATCH_SIZE = 100
  let offset = 0

  async function fetchBatch(currentOffset: number) {
    const batch = await db.execute(sql`
      SELECT id, content FROM pages ORDER BY id LIMIT ${BATCH_SIZE} OFFSET ${currentOffset};
    `)

    if (!batch || !batch.rows || batch.rows.length === 0) {
      return null
    }

    const rows: Array<{ id: string; content: unknown }> = batch.rows
    return rows
  }

  async function processBatch(pagesList: Array<{ id: string; content: unknown }>) {
    const updatePromises = pagesList.map((page) => {
      const transformed = transformLegacyContent(page.content)
      return db.execute(sql`
        UPDATE pages SET content = ${JSON.stringify(transformed)}::jsonb WHERE id = ${page.id}::uuid;
      `)
    })

    await Promise.all(updatePromises)
  }

  async function processAllBatches(currentOffset: number): Promise<void> {
    const pagesList = await fetchBatch(currentOffset)
    if (!pagesList) return
    await processBatch(pagesList)
    console.log(`[Migration] Migrated ${currentOffset + BATCH_SIZE} records...`)
    return processAllBatches(currentOffset + BATCH_SIZE)
  }

  await processAllBatches(offset)

  console.log("[Migration] Migration completed successfully.")
}

export function transformLegacyContent(raw: unknown) {
  if (typeof raw === "object" && raw !== null && "blocks" in raw) return raw
  let textContent = ""
  try {
    textContent = typeof raw === "string" ? raw : JSON.stringify(raw ?? "")
  } catch {
    textContent = ""
  }
  return {
    blocks: [
      {
        id: crypto.randomUUID(),
        type: "ParagraphBlock",
        props: { text: { en: textContent } }
      }
    ],
    properties: {}
  }
}
