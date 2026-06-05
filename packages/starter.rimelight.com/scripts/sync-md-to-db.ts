import "dotenv/config"
import fs from "node:fs"
import path from "node:path"
import { db } from "../src/db"
import * as schema from "../src/db/schema"
import { sql, and, isNull, isNotNull } from "drizzle-orm"
import { type PgTable, type PgColumn } from "drizzle-orm/pg-core"

interface SchemaWithPages {
  pages?: Record<string, unknown>
}

interface PageRow {
  id: string
  slug: string
  title: Record<string, string>
  description: Record<string, string>
  content: { blocks?: Block[] }
  updatedAt: string | Date
}

export type Block = any

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
function extractTextFromBlocks(blocks: Block[]): string {
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

// Basic markdown frontmatter parser
function parseMarkdown(filePath: string) {
  const fileContent = fs.readFileSync(filePath, "utf-8")
  const match = fileContent.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/)
  if (!match) {
    return { title: path.basename(filePath, path.extname(filePath)), body: fileContent }
  }
  const yaml = match[1] ?? ""
  const body = match[2] ?? ""
  const data: Record<string, string> = {}
  for (const line of yaml.split("\n")) {
    const parts = line.split(":")
    if (parts.length >= 2) {
      const key = (parts[0] ?? "").trim()
      const value = parts
        .slice(1)
        .join(":")
        .trim()
        .replace(/^['"]|['"]$/g, "")
      data[key] = value
    }
  }
  return {
    title: data.title || path.basename(filePath, path.extname(filePath)),
    body
  }
}

function getFilesRecursively(dir: string): string[] {
  if (!fs.existsSync(dir)) return []
  const files: string[] = []
  const list = fs.readdirSync(dir)
  for (const file of list) {
    const filePath = path.join(dir, file)
    const stat = fs.statSync(filePath)
    if (stat && stat.isDirectory()) {
      files.push(...getFilesRecursively(filePath))
    } else if (file.endsWith(".md") || file.endsWith(".mdx")) {
      files.push(filePath)
    }
  }
  return files
}

async function sync() {
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    console.warn("[Sync] DATABASE_URL is not set. Skipping search index synchronization.")
    return
  }

  const searchIndexTable = schema.searchIndex
  if (!searchIndexTable) {
    console.warn("[Sync] 'searchIndex' table not found in Drizzle schema. Skipping sync.")
    return
  }

  const hasSearchTable = await tableExists("search_index")
  if (!hasSearchTable) {
    console.warn(
      "[Sync] 'search_index' table does not exist in the database yet. Please run migrations first."
    )
    return
  }

  console.log("Starting database & markdown search_index sync...")

  // 1. Fetch all existing records from the DB to build a cache map
  const existing = await db
    .select({
      sourceId: searchIndexTable.sourceId,
      sourceType: searchIndexTable.sourceType,
      updatedAt: searchIndexTable.updatedAt
    })
    .from(searchIndexTable)

  const existingMap = new Map<string, Date>(
    existing.map((row) => [`${row.sourceType}:${row.sourceId}`, new Date(row.updatedAt)])
  )
  console.log(`Fetched ${existingMap.size} existing records from database index.`)

  const activeSourceKeys = new Set<string>()
  const toUpsert: any[] = []

  // --- PART 1: Sync Markdown Content collections ---
  const collections = [
    { name: "blog", dir: "./src/content/blog", urlPrefix: "/blog" },
    { name: "docs", dir: "./src/content/docs", urlPrefix: "/docs" },
    { name: "legal", dir: "./src/content/legal", urlPrefix: "/legal" }
  ]

  for (const col of collections) {
    const fullDir = path.resolve(col.dir)
    const files = getFilesRecursively(fullDir)

    for (const filePath of files) {
      const relativePath = path.relative(fullDir, filePath).replace(/\\/g, "/")
      const sourceType = "markdown"
      const sourceId = `${col.name}:${relativePath}`
      const cacheKey = `${sourceType}:${sourceId}`
      activeSourceKeys.add(cacheKey)

      const stat = fs.statSync(filePath)
      const mtime = stat.mtime

      const dbUpdatedAt = existingMap.get(cacheKey)
      if (dbUpdatedAt && mtime <= dbUpdatedAt) {
        continue
      }

      let urlSlug = relativePath
        .replace(/\.mdx?$/, "")
        .replace(/[/\\]index$/, "")
        .replace(/\\/g, "/")

      if (urlSlug === "index" || urlSlug === "") {
        urlSlug = ""
      }

      const url = `${col.urlPrefix}${urlSlug ? "/" + urlSlug : ""}`
      const { title, body } = parseMarkdown(filePath)

      console.log(`Queueing markdown sync: ${sourceId} -> ${url}`)

      toUpsert.push({
        sourceType,
        sourceId,
        title,
        url,
        bodyContent: body,
        searchableText: sql`setweight(to_tsvector('english', ${title}), 'A') || setweight(to_tsvector('english', ${body}), 'B')`,
        updatedAt: mtime
      })
    }
  }

  // --- PART 2: Sync Dynamic Database Pages ---
  const pagesTable = (schema as unknown as SchemaWithPages).pages
  const hasPagesTable = pagesTable && (await tableExists("pages"))

  if (hasPagesTable) {
    console.log("Fetching pages from 'pages' database table...")
    try {
      const dbPages = (await db
        .select({
          id: pagesTable["id"] as PgColumn,
          slug: pagesTable["slug"] as PgColumn,
          title: pagesTable["title"] as PgColumn,
          description: pagesTable["description"] as PgColumn,
          content: pagesTable["content"] as PgColumn,
          updatedAt: pagesTable["updatedAt"] as PgColumn
        })
        .from(pagesTable as unknown as PgTable)
        .where(
          and(
            isNull(pagesTable["deletedAt"] as PgColumn),
            isNotNull(pagesTable["postedAt"] as PgColumn)
          )
        )) as unknown as PageRow[]

      for (const pageRow of dbPages) {
        const sourceType = "database_page"
        const sourceId = pageRow.id
        const cacheKey = `${sourceType}:${sourceId}`
        activeSourceKeys.add(cacheKey)

        const updatedAt = pageRow.updatedAt ? new Date(pageRow.updatedAt) : new Date(0)
        const dbUpdatedAt = existingMap.get(cacheKey)

        if (dbUpdatedAt && updatedAt <= dbUpdatedAt) {
          continue
        }

        const titleObj = pageRow.title ?? {}
        const title = titleObj?.en || Object.values(titleObj || {})[0] || "Untitled Page"

        const descObj = pageRow.description ?? {}
        const description = descObj?.en || Object.values(descObj || {})[0] || ""

        const bodyContent =
          `${description} ${extractTextFromBlocks(pageRow.content?.blocks || [])}`.trim()
        const url = `/${pageRow.slug}`

        console.log(`Queueing database page sync: ${title} -> ${url}`)

        toUpsert.push({
          sourceType,
          sourceId,
          title,
          url,
          bodyContent,
          searchableText: sql`setweight(to_tsvector('english', ${title}), 'A') || setweight(to_tsvector('english', ${bodyContent}), 'B')`,
          updatedAt
        })
      }
    } catch (pageErr: any) {
      console.warn("[Sync] Failed to fetch pages from database table:", pageErr.message)
    }
  } else {
    console.log("[Sync] 'pages' table not present in database schema. Skipping database page sync.")
  }

  // 2. Perform batched updates in chunks of 50
  if (toUpsert.length > 0) {
    const chunkSize = 50
    const batchCount = Math.ceil(toUpsert.length / chunkSize)
    const upsertPromises: Array<Promise<void>> = []

    for (let i = 0; i < toUpsert.length; i += chunkSize) {
      const chunk = toUpsert.slice(i, i + chunkSize)
      upsertPromises.push(
        db
          .insert(searchIndexTable)
          .values(chunk)
          .onConflictDoUpdate({
            target: [searchIndexTable.sourceType, searchIndexTable.sourceId],
            set: {
              title: sql`excluded.title`,
              url: sql`excluded.url`,
              bodyContent: sql`excluded.body_content`,
              searchableText: sql`excluded.searchable_text`,
              updatedAt: sql`excluded.updated_at`
            }
          })
          .then(() => {
            console.log(
              `Upserting batch ${Math.floor(i / chunkSize) + 1}/${batchCount} (${chunk.length} items)...`
            )
          })
      )
    }
    await Promise.all(upsertPromises)
  }

  // 3. Remove deleted/unpublished documents from the index
  const toDeleteMap = new Map<string, string[]>()
  for (const row of existing) {
    const cacheKey = `${row.sourceType}:${row.sourceId}`
    if (!activeSourceKeys.has(cacheKey)) {
      if (!toDeleteMap.has(row.sourceType)) {
        toDeleteMap.set(row.sourceType, [])
      }
      toDeleteMap.get(row.sourceType)!.push(row.sourceId)
    }
  }

  const deletePromises: Array<Promise<void>> = []
  for (const [type, ids] of toDeleteMap.entries()) {
    if (ids.length > 0) {
      deletePromises.push(
        db
          .delete(searchIndexTable)
          .where(
            and(
              sql`${searchIndexTable.sourceType} = ${type}`,
              sql`${searchIndexTable.sourceId} IN ${ids}`
            )
          )
          .then(() => {
            console.log(
              `Cleaning up ${ids.length} deleted/unpublished ${type} records from database index...`
            )
          })
      )
    }
  }
  await Promise.all(deletePromises)

  console.log("Sync completed successfully!")
}

sync().catch((err) => {
  console.error("Sync failed:", err)
  process.exit(1)
})
