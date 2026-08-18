import fs from "node:fs"
import path from "node:path"
import { db } from "@/db/index.ts"
import { pages } from "@/db/schema/index.ts"
import { eq, and } from "drizzle-orm"
import type { APIRoute } from "astro"

export const GET: APIRoute = async () => {
  // Simple approach: use the known absolute path
  const docsDir =
    "C:/Users/idant/WebstormProjects/rimelight/apps/starter.rimelight.com/src/content/docs"

  console.log(`[Migration API] Docs dir: ${docsDir}`)
  console.log(`[Migration API] Exists: ${fs.existsSync(docsDir)}`)

  if (!fs.existsSync(docsDir)) {
    return new Response(JSON.stringify({ error: "Docs directory not found", docsDir }), {
      status: 404
    })
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

  let successCount = 0
  let errorCount = 0

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

  for (const filePath of files) {
    const relPath = path.relative(docsDir, filePath).replace(/\\/g, "/")
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

    const slugsToCreate: string[] = []
    if (version) {
      slugsToCreate.push(docSlug === "index" ? `${version}/index` : `${version}/${docSlug}`)
      if (version === "v2.0.0") {
        slugsToCreate.push(docSlug)
      }
    } else {
      slugsToCreate.push(docSlug)
    }

    for (const slug of slugsToCreate) {
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
          blocks: [
            {
              id: crypto.randomUUID(),
              type: "ParagraphBlock",
              props: { text: { en: body } }
            }
          ],
          properties
        }
      }

      try {
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
      } catch (err: any) {
        errorCount++
        console.error(`Failed migrating slug "${slug}" from ${relPath}:`, err?.message || err)
      }
    }
  }

  return new Response(
    JSON.stringify({
      success: true,
      totalFiles: files.length,
      successCount,
      errorCount
    }),
    { status: 200 }
  )
}
