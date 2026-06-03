import "dotenv/config"
import fs from "node:fs"
import path from "node:path"
import { db } from "../src/db"
import { searchIndex } from "../src/db/schema"
import { sql, eq, inArray, and } from "drizzle-orm"

// Basic markdown frontmatter parser
function parseMarkdown(filePath: string) {
  const fileContent = fs.readFileSync(filePath, "utf-8")
  const match = fileContent.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/)
  if (!match) {
    return { title: path.basename(filePath, path.extname(filePath)), body: fileContent }
  }
  const yaml = match[1]
  const body = match[2]
  const data: Record<string, string> = {}
  for (const line of yaml.split("\n")) {
    const parts = line.split(":")
    if (parts.length >= 2) {
      const key = parts[0].trim()
      const value = parts.slice(1).join(":").trim().replace(/^['"]|['"]$/g, "")
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
  console.log("Starting optimized markdown to search_index sync...")
  
  // 1. Fetch all existing markdown records from the DB to build a cache map
  const existing = await db
    .select({
      sourceId: searchIndex.sourceId,
      updatedAt: searchIndex.updatedAt
    })
    .from(searchIndex)
    .where(eq(searchIndex.sourceType, "markdown"))

  const existingMap = new Map<string, Date>(
    existing.map(row => [row.sourceId, new Date(row.updatedAt)])
  )
  console.log(`Fetched ${existingMap.size} existing markdown records from database.`)

  const collections = [
    { name: "blog", dir: "./src/content/blog", urlPrefix: "/company/blog" },
    { name: "docs", dir: "./src/content/docs", urlPrefix: "/company/docs" },
    { name: "legal", dir: "./src/content/legal", urlPrefix: "/company/legal" }
  ]

  const activeSourceIds = new Set<string>()
  const toUpsert: any[] = []

  for (const col of collections) {
    const fullDir = path.resolve(col.dir)
    const files = getFilesRecursively(fullDir)

    for (const filePath of files) {
      const relativePath = path.relative(fullDir, filePath)
      const sourceId = `${col.name}:${relativePath}`
      activeSourceIds.add(sourceId)

      // Get file modification time
      const stat = fs.statSync(filePath)
      const mtime = stat.mtime

      // Check if file is modified since last sync
      const dbUpdatedAt = existingMap.get(sourceId)
      if (dbUpdatedAt && mtime <= dbUpdatedAt) {
        // File is unchanged, skip syncing it
        continue
      }

      // Generate URLs
      let urlSlug = relativePath
        .replace(/\.mdx?$/, "")
        .replace(/[/\\]index$/, "")
        .replace(/\\/g, "/")
      
      if (urlSlug === "index" || urlSlug === "") {
        urlSlug = ""
      }
      
      const url = `${col.urlPrefix}${urlSlug ? "/" + urlSlug : ""}`
      const { title, body } = parseMarkdown(filePath)

      console.log(`Queueing upsert for modified/new file: ${sourceId} -> ${url}`)

      toUpsert.push({
        sourceType: "markdown",
        sourceId,
        title,
        url,
        bodyContent: body,
        searchableText: sql`setweight(to_tsvector('english', ${title}), 'A') || setweight(to_tsvector('english', ${body}), 'B')`,
        updatedAt: mtime
      })
    }
  }

  // 2. Perform batched updates in chunks of 50
  const chunkSize = 50
  for (let i = 0; i < toUpsert.length; i += chunkSize) {
    const chunk = toUpsert.slice(i, i + chunkSize)
    console.log(`Upserting batch ${Math.floor(i / chunkSize) + 1}/${Math.ceil(toUpsert.length / chunkSize)} (${chunk.length} items)...`)
    await db.insert(searchIndex).values(chunk).onConflictDoUpdate({
      target: [searchIndex.sourceType, searchIndex.sourceId],
      set: {
        title: sql`excluded.title`,
        url: sql`excluded.url`,
        bodyContent: sql`excluded.body_content`,
        searchableText: sql`excluded.searchable_text`,
        updatedAt: sql`excluded.updated_at`
      }
    })
  }

  // 3. Remove deleted documents
  const toDelete = Array.from(existingMap.keys()).filter(id => !activeSourceIds.has(id))
  if (toDelete.length > 0) {
    console.log(`Cleaning up ${toDelete.length} deleted files from database index...`)
    await db.delete(searchIndex).where(
      and(
        eq(searchIndex.sourceType, "markdown"),
        inArray(searchIndex.sourceId, toDelete)
      )
    )
  }

  console.log("Sync completed successfully!")
}

sync().catch((err) => {
  console.error("Sync failed:", err)
  process.exit(1)
})
