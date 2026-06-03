import "dotenv/config"
import fs from "node:fs"
import path from "node:path"
import { db } from "../src/db"
import { searchIndex } from "../src/db/schema"
import { sql } from "drizzle-orm"

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
  console.log("Starting markdown to search_index sync...")
  const collections = [
    { name: "blog", dir: "./src/content/blog", urlPrefix: "/company/blog" },
    { name: "docs", dir: "./src/content/docs", urlPrefix: "/company/docs" },
    { name: "legal", dir: "./src/content/legal", urlPrefix: "/company/legal" }
  ]

  for (const col of collections) {
    const fullDir = path.resolve(col.dir)
    console.log(`Syncing ${col.name} from ${fullDir}...`)
    const files = getFilesRecursively(fullDir)
    console.log(`Found ${files.length} files in ${col.name}`)

    for (const filePath of files) {
      const relativePath = path.relative(fullDir, filePath)
      // Remove extensions and index suffix
      let urlSlug = relativePath
        .replace(/\.mdx?$/, "")
        .replace(/[/\\]index$/, "")
        .replace(/\\/g, "/")
      
      if (urlSlug === "index" || urlSlug === "") {
        urlSlug = ""
      }
      
      const url = `${col.urlPrefix}${urlSlug ? "/" + urlSlug : ""}`
      const { title, body } = parseMarkdown(filePath)

      console.log(`Upserting ${col.name}:${relativePath} -> ${url}`)
      
      // Use clean database inserts
      await db.insert(searchIndex).values({
        sourceType: "markdown",
        sourceId: `${col.name}:${relativePath}`,
        title,
        url,
        bodyContent: body,
        searchableText: sql`setweight(to_tsvector('english', ${title}), 'A') || setweight(to_tsvector('english', ${body}), 'B')`
      }).onConflictDoUpdate({
        target: [searchIndex.sourceType, searchIndex.sourceId],
        set: {
          title,
          url,
          bodyContent: body,
          searchableText: sql`setweight(to_tsvector('english', ${title}), 'A') || setweight(to_tsvector('english', ${body}), 'B')`,
          updatedAt: new Date()
        }
      })
    }
  }

  console.log("Sync completed successfully!")
}

sync().catch((err) => {
  console.error("Sync failed:", err)
  process.exit(1)
})
