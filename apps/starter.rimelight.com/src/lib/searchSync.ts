import { getCollection } from "astro:content"
import { db } from "@/db"
import * as schema from "@/db/schema"
import { sql, and, isNull, isNotNull } from "drizzle-orm"

// Helper to check table existence in database
async function tableExists(tableName: string): Promise<boolean> {
  try {
    await db.execute(
      sql`SELECT 1 FROM information_schema.tables WHERE table_name = ${tableName} LIMIT 1`
    )
    return true
  } catch {
    return false
  }
}

// Extract text from editor content blocks for database pages
function extractTextFromBlocks(blocks: any[]): string {
  if (!blocks || !Array.isArray(blocks)) return ""
  let text = ""
  for (const block of blocks) {
    if (!block) continue
    if (block.type === "SectionBlock") {
      text += ` ${block.props.title || ""} ${block.props.description || ""}`
      if (block.props.children) {
        text += ` ${extractTextFromBlocks(block.props.children)}`
      }
    } else if (block.type === "ParagraphBlock") {
      if (Array.isArray(block.props.text)) {
        for (const item of block.props.text) {
          if (item && (item.type === "text" || item.type === "link")) {
            text += ` ${item.props.content || ""}`
          }
        }
      }
    } else if (block.type === "CalloutBlock") {
      if (block.props.children) {
        text += ` ${extractTextFromBlocks(block.props.children)}`
      }
    } else if (block.type === "ImageBlock") {
      text += ` ${block.props.alt || ""} ${block.props.caption || ""}`
    }
  }
  return text.trim()
}

// Exported sync logic helper for in-process execution
export async function doSearchSync() {
  const hasSearchTable = await tableExists("search_index")
  if (!hasSearchTable) {
    throw new Error(
      "search_index table does not exist in the database. Run drizzle-kit push first."
    )
  }

  const activeSourceKeys = new Set<string>()
  const toUpsert: any[] = []

  // --- PART 1: Fetch Markdown collections ---
  const blogCollection = await getCollection("blog")
  for (const entry of blogCollection) {
    const sourceId = `blog:${entry.id}`
    const cacheKey = `markdown:${sourceId}`
    activeSourceKeys.add(cacheKey)

    const parts = entry.id.split("/")
    const locale = parts[0]
    let subSlug = parts.slice(1).join("/")
    subSlug = subSlug.replace(/[/\\]index$/, "")
    if (subSlug === "index" || subSlug === "") {
      subSlug = ""
    }
    const pageUrl = `/${locale}/blog${subSlug ? "/" + subSlug : ""}`

    toUpsert.push({
      sourceType: "markdown",
      sourceId,
      title: entry.data.title || "Untitled Blog Post",
      url: pageUrl,
      bodyContent: entry.body || "",
      searchableText: `${entry.data.title || "Untitled Blog Post"} ${entry.body || ""}`,
      updatedAt: new Date()
    })
  }

  const legalCollection = await getCollection("legal")
  for (const entry of legalCollection) {
    const sourceId = `legal:${entry.id}`
    const cacheKey = `markdown:${sourceId}`
    activeSourceKeys.add(cacheKey)

    const parts = entry.id.split("/")
    const locale = parts[0]
    let subSlug = parts.slice(1).join("/")
    subSlug = subSlug.replace(/[/\\]index$/, "")
    if (subSlug === "index" || subSlug === "") {
      subSlug = ""
    }
    const pageUrl = `/${locale}/legal${subSlug ? "/" + subSlug : ""}`

    toUpsert.push({
      sourceType: "markdown",
      sourceId,
      title: entry.data.title || "Untitled Legal Document",
      url: pageUrl,
      bodyContent: entry.body || "",
      searchableText: `${entry.data.title || "Untitled Legal Document"} ${entry.body || ""}`,
      updatedAt: new Date()
    })
  }

  // --- PART 2: Fetch Dynamic Pages if 'pages' table exists ---
  const pagesTable = Reflect.get(schema, "pages")
  const hasPagesTable = pagesTable && (await tableExists("pages"))

  if (hasPagesTable) {
    const dbPages = await db
      .select({
        id: pagesTable.id,
        slug: pagesTable.slug,
        type: pagesTable.type,
        title: pagesTable.title,
        description: pagesTable.description,
        content: pagesTable.content,
        updatedAt: pagesTable.updatedAt
      })
      .from(pagesTable)
      .where(and(isNull(pagesTable.deletedAt), isNotNull(pagesTable.postedAt)))

    for (const row of dbPages) {
      const sourceType = "database_page"
      const sourceId = row.id
      const cacheKey = `${sourceType}:${sourceId}`
      activeSourceKeys.add(cacheKey)

      const titleObj = row.title || {}
      const title = Reflect.get(titleObj, "en") || Object.values(titleObj)[0] || "Untitled Page"

      const descObj = row.description || {}
      const description = Reflect.get(descObj, "en") || Object.values(descObj)[0] || ""

      const contentObj = row.content || {}
      const blocks = Reflect.get(contentObj, "blocks") || []
      const bodyContent = `${description} ${extractTextFromBlocks(blocks)}`.trim()
      let pageUrl = `/${row.slug}`
      if (row.type === "doc") {
        pageUrl = `/en/docs${row.slug === "index" ? "" : "/" + row.slug}`
      } else if (row.type === "blog") {
        pageUrl = `/en/blog${row.slug === "index" ? "" : "/" + row.slug}`
      }

      toUpsert.push({
        sourceType: "database_page",
        sourceId,
        title,
        url: pageUrl,
        bodyContent,
        searchableText: `${title} ${bodyContent}`,
        updatedAt: row.updatedAt ? new Date(row.updatedAt) : new Date()
      })
    }
  }

  // --- PART 3: Upsert records in D1 ---
  const syncedIds: string[] = []
  if (toUpsert.length > 0) {
    const chunkSize = 10
    /* eslint-disable no-await-in-loop */
    for (let i = 0; i < toUpsert.length; i += chunkSize) {
      const chunk = toUpsert.slice(i, i + chunkSize)
      const insertedRows = await db
        .insert(schema.searchIndex)
        .values(chunk)
        .onConflictDoUpdate({
          target: [schema.searchIndex.sourceType, schema.searchIndex.sourceId],
          set: {
            title: sql`excluded.title`,
            url: sql`excluded.url`,
            bodyContent: sql`excluded.body_content`,
            searchableText: sql`excluded.searchable_text`,
            updatedAt: sql`excluded.updated_at`
          }
        })
        .returning({
          id: schema.searchIndex.id,
          title: schema.searchIndex.title,
          bodyContent: schema.searchIndex.bodyContent
        })

      if (insertedRows && insertedRows.length > 0) {
        const ids = insertedRows.map((r) => r.id)
        syncedIds.push(...ids)
      }
    }
  }

  // --- PART 4: Clean up removed items ---
  const allExisting = await db
    .select({
      id: schema.searchIndex.id,
      sourceType: schema.searchIndex.sourceType,
      sourceId: schema.searchIndex.sourceId
    })
    .from(schema.searchIndex)

  const staleIds: string[] = []
  for (const row of allExisting) {
    const cacheKey = `${row.sourceType}:${row.sourceId}`
    if (!activeSourceKeys.has(cacheKey)) {
      staleIds.push(row.id)
    }
  }

  if (staleIds.length > 0) {
    const deleteChunkSize = 50
    /* eslint-disable no-await-in-loop */
    for (let i = 0; i < staleIds.length; i += deleteChunkSize) {
      const chunk = staleIds.slice(i, i + deleteChunkSize)
      await db.delete(schema.searchIndex).where(sql`id IN ${chunk}`)
    }
  }

  return {
    upserted: toUpsert.length,
    deleted: staleIds.length
  }
}
