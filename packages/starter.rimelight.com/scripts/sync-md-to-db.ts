import "dotenv/config"
import fs from "node:fs"
import path from "node:path"
import { db } from "../src/db"
import * as schema from "../src/db/schema"
import { sql, and, isNull, isNotNull } from "drizzle-orm"

export type Block = any

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

async function sync() {
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

  await ensureFtsTable()

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
        updatedAt: mtime
      })
    }
  }

  // --- PART 2: Sync Dynamic Database Pages ---
  const pagesTable = Reflect.get(schema, "pages")
  const hasPagesTable = pagesTable && (await tableExists("pages"))

  if (hasPagesTable) {
    console.log("Fetching pages from 'pages' database table...")
    try {
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

        const updatedAt = row.updatedAt ? new Date(row.updatedAt) : new Date(0)
        const dbUpdatedAt = existingMap.get(cacheKey)

        if (dbUpdatedAt && updatedAt <= dbUpdatedAt) {
          continue
        }

        const titleObj = row.title || {}
        const title = Reflect.get(titleObj, "en") || Object.values(titleObj)[0] || "Untitled Page"

        const descObj = row.description || {}
        const description = Reflect.get(descObj, "en") || Object.values(descObj)[0] || ""

        const contentObj = row.content || {}
        const blocks = Reflect.get(contentObj, "blocks") || []
        const bodyContent = `${description} ${extractTextFromBlocks(blocks)}`.trim()
        const url = `/${row.slug}`

        console.log(`Queueing database page sync: ${title} -> ${url}`)

        toUpsert.push({
          sourceType,
          sourceId,
          title,
          url,
          bodyContent,
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
              updatedAt: sql`excluded.updated_at`
            }
          })
          .returning({
            id: searchIndexTable.id,
            title: searchIndexTable.title,
            bodyContent: searchIndexTable.bodyContent
          })
          .then(async (insertedRows) => {
            console.log(
              `Upserted batch ${Math.floor(i / chunkSize) + 1}/${batchCount} (${chunk.length} items)...`
            )
            // Sync FTS5 virtual table manually
            if (insertedRows && insertedRows.length > 0) {
              const ids = insertedRows.map((r) => r.id)
              await db.delete(schema.searchIndexFts).where(sql`rowid IN ${ids}`)
              await db.insert(schema.searchIndexFts).values(
                insertedRows.map((r) => ({
                  rowid: r.id,
                  title: r.title,
                  bodyContent: r.bodyContent
                }))
              )
            }
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

  // Remove stale records from FTS5 table
  await db.delete(schema.searchIndexFts).where(sql`rowid NOT IN (SELECT id FROM search_index)`)

  console.log("Sync completed successfully!")
}

sync().catch((err) => {
  console.error("Sync failed:", err)
  process.exit(1)
})
