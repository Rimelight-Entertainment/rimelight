import type { APIRoute } from "astro"
import { getCollection } from "astro:content"
import { db } from "@/db"
import * as schema from "@/db/schema"
import { sql, and, isNull, isNotNull } from "drizzle-orm"

// Helper to check table existence in database
async function tableExists(tableName: string): Promise<boolean> {
  try {
    await db.run(
      sql`SELECT 1 FROM sqlite_master WHERE type='table' AND name = ${tableName} LIMIT 1`
    )
    return true
  } catch {
    return false
  }
}

// Helper to create the FTS5 virtual table if it doesn't exist
async function ensureFtsTable(): Promise<void> {
  try {
    await db.run(
      sql`CREATE VIRTUAL TABLE IF NOT EXISTS search_index_fts USING fts5(
        title,
        body_content,
        content='search_index',
        content_rowid='id'
      )`
    )
  } catch (err: any) {
    console.warn("[Sync] Failed to ensure FTS5 virtual table exists:", err.message)
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

  await ensureFtsTable()

  const activeSourceKeys = new Set<string>()
  const toUpsert: any[] = []

  // --- PART 1: Fetch Markdown collections ---
  const blogCollection = await getCollection("blog")
  for (const entry of blogCollection) {
    const sourceId = `blog:${entry.id}`
    const cacheKey = `markdown:${sourceId}`
    activeSourceKeys.add(cacheKey)

    let urlSlug = entry.id.replace(/[/\\]index$/, "")
    if (urlSlug === "index" || urlSlug === "") {
      urlSlug = ""
    }
    const pageUrl = `/blog${urlSlug ? "/" + urlSlug : ""}`

    toUpsert.push({
      sourceType: "markdown",
      sourceId,
      title: entry.data.title || "Untitled Blog Post",
      url: pageUrl,
      bodyContent: entry.body || "",
      updatedAt: new Date()
    })
  }

  const docsCollection = await getCollection("docs")
  for (const entry of docsCollection) {
    const sourceId = `docs:${entry.id}`
    const cacheKey = `markdown:${sourceId}`
    activeSourceKeys.add(cacheKey)

    let urlSlug = entry.id.replace(/[/\\]index$/, "")
    if (urlSlug === "index" || urlSlug === "") {
      urlSlug = ""
    }
    const pageUrl = `/docs${urlSlug ? "/" + urlSlug : ""}`

    toUpsert.push({
      sourceType: "markdown",
      sourceId,
      title: entry.data.title || "Untitled Documentation",
      url: pageUrl,
      bodyContent: entry.body || "",
      updatedAt: new Date()
    })
  }

  const legalCollection = await getCollection("legal")
  for (const entry of legalCollection) {
    const sourceId = `legal:${entry.id}`
    const cacheKey = `markdown:${sourceId}`
    activeSourceKeys.add(cacheKey)

    let urlSlug = entry.id.replace(/[/\\]index$/, "")
    if (urlSlug === "index" || urlSlug === "") {
      urlSlug = ""
    }
    const pageUrl = `/legal${urlSlug ? "/" + urlSlug : ""}`

    toUpsert.push({
      sourceType: "markdown",
      sourceId,
      title: entry.data.title || "Untitled Legal Document",
      url: pageUrl,
      bodyContent: entry.body || "",
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
        title: pagesTable.title,
        description: pagesTable.description,
        content: pagesTable.content,
        updatedAt: pagesTable.updatedAt
      })
      .from(pagesTable)
      .where(and(isNull(pagesTable.deletedAt), isNotNull(pagesTable.postedAt)))

    for (const row of dbPages) {
      const sourceType = "database_page"
      const sourceId = String(row.id)
      const cacheKey = `${sourceType}:${sourceId}`
      activeSourceKeys.add(cacheKey)

      const titleObj = row.title || {}
      const title = Reflect.get(titleObj, "en") || Object.values(titleObj)[0] || "Untitled Page"

      const descObj = row.description || {}
      const description = Reflect.get(descObj, "en") || Object.values(descObj)[0] || ""

      const contentObj = row.content || {}
      const blocks = Reflect.get(contentObj, "blocks") || []
      const bodyContent = `${description} ${extractTextFromBlocks(blocks)}`.trim()
      const pageUrl = `/${row.slug}`

      toUpsert.push({
        sourceType: "database_page",
        sourceId,
        title,
        url: pageUrl,
        bodyContent,
        updatedAt: row.updatedAt ? new Date(row.updatedAt) : new Date()
      })
    }
  }

  // --- PART 3: Upsert records in D1 ---
  const syncedIds: string[] = []
  if (toUpsert.length > 0) {
    const chunkSize = 50
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

        // Sync FTS5 virtual table manually
        await db.delete(schema.searchIndexFts).where(sql`rowid IN ${ids}`)
        await db.insert(schema.searchIndexFts).values(
          insertedRows.map((r) => ({
            rowid: r.id,
            title: r.title,
            bodyContent: r.bodyContent
          }))
        )
      }
    }
  }

  // --- PART 4: Clean up removed items ---
  // Fetch all IDs currently in the D1 index
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
    await db.delete(schema.searchIndex).where(sql`id IN ${staleIds}`)
    await db.delete(schema.searchIndexFts).where(sql`rowid IN ${staleIds}`)
  }

  return {
    upserted: toUpsert.length,
    deleted: staleIds.length
  }
}

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url)
  const token = url.searchParams.get("token")
  const syncToken = import.meta.env.SYNC_TOKEN ?? process.env.SYNC_TOKEN

  // Secure token validation in production
  if (import.meta.env.PROD && (!syncToken || token !== syncToken)) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" }
    })
  }

  try {
    const result = await doSearchSync()
    return new Response(
      JSON.stringify({
        success: true,
        ...result
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    )
  } catch (error: any) {
    console.error("[Search Sync API Global Error]:", error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    })
  }
}
