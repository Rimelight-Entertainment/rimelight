import fs from "node:fs"
import path from "node:path"

if (!process.env.DATABASE_URL && fs.existsSync(".env")) {
  try {
    process.loadEnvFile(".env")
  } catch {}
}

import { db } from "../src/db/index.ts"
import { searchIndex, pages } from "../src/db/schema/index.ts"
import { sql, eq, inArray, and, isNull, isNotNull } from "drizzle-orm"
import { type Block } from "../src/types/pages.ts"

const pad = (n: number) => n.toString().padStart(2, "0")

const originalLog = console.log
console.log = (...args: any[]) => {
  const now = new Date()
  const timestamp = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
  originalLog(`${timestamp} [sync-md-to-db]`, ...args)
}

const originalError = console.error
console.error = (...args: any[]) => {
  const now = new Date()
  const timestamp = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
  originalError(`${timestamp} [sync-md-to-db]`, ...args)
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
  console.log("Starting optimized database & markdown search_index sync...")

  if (!process.env.DATABASE_URL) {
    console.log("DATABASE_URL is not set; skipping database sync step.")
    return
  }

  // 1. Fetch all existing records from the DB to build a cache map
  const existing = await db
    .select({
      sourceId: searchIndex.sourceId,
      sourceType: searchIndex.sourceType,
      updatedAt: searchIndex.updatedAt
    })
    .from(searchIndex)

  const existingMap = new Map<string, Date>(
    existing.map((row) => [`${row.sourceType}:${row.sourceId}`, new Date(row.updatedAt)])
  )
  console.log(`Fetched ${existingMap.size} existing records from database index.`)

  const activeSourceKeys = new Set<string>()
  const toUpsert: any[] = []

  // --- PART 1: Sync Markdown Content collections ---
  const collections = [
    { name: "blog", dir: "./src/content/blog", urlPrefix: "/company/blog" },
    { name: "docs", dir: "./src/content/docs", urlPrefix: "/company/docs" },
    { name: "legal", dir: "./src/content/legal", urlPrefix: "/company/legal" }
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
  console.log("Fetching pages from 'pages' database table...")
  const dbPages = await db
    .select({
      id: pages.id,
      slug: pages.slug,
      title: pages.title,
      description: pages.description,
      content: pages.content,
      updatedAt: pages.updatedAt
    })
    .from(pages)
    .where(and(isNull(pages.deletedAt), isNotNull(pages.postedAt)))

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

    // Dynamic pages titles are Localized objects { en: "..." }
    const titleObj = pageRow.title ?? {}
    const title = titleObj?.en || Object.values(titleObj || {})[0] || "Untitled Page"

    const descObj = pageRow.description ?? {}
    const description = descObj?.en || Object.values(descObj || {})[0] || ""

    // Extract text content from custom editor blocks
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

  // 2. Perform batched updates in chunks of 50
  const chunkSize = 50
  const batchCount = Math.ceil(toUpsert.length / chunkSize)
  const upsertPromises: Array<Promise<void>> = []
  for (let i = 0; i < toUpsert.length; i += chunkSize) {
    const chunk = toUpsert.slice(i, i + chunkSize)
    upsertPromises.push(
      db
        .insert(searchIndex)
        .values(chunk)
        .onConflictDoUpdate({
          target: [searchIndex.sourceType, searchIndex.sourceId],
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
          return
        })
    )
  }
  await Promise.all(upsertPromises)

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
    deletePromises.push(
      db
        .delete(searchIndex)
        .where(and(eq(searchIndex.sourceType, type), inArray(searchIndex.sourceId, ids)))
        .then(() => {
          console.log(
            `Cleaning up ${ids.length} deleted/unpublished ${type} records from database index...`
          )
          return
        })
    )
  }
  await Promise.all(deletePromises)

  console.log("Sync completed successfully!")
}

sync().catch((err) => {
  console.error("Sync failed:", err)
  process.exit(1)
})
