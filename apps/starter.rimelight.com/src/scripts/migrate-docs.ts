import fs from "node:fs"
import path from "node:path"
import { db } from "../db/index.ts"
import { pages } from "../db/schema/index.ts"
import { convertMarkdownDocToPageRecord, parseMarkdownWithFrontmatter } from "@rimelight/cms"
import { eq, and } from "drizzle-orm"

/**
 * Migrates all Markdown/MDX docs from src/content/docs into the CMS `pages` database table.
 */
export async function migrateDocs() {
  const docsDir = path.resolve(process.cwd(), "src/content/docs")
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
      const pageRecord = convertMarkdownDocToPageRecord({
        slug,
        title: { [locale || "en"]: title },
        description: { [locale || "en"]: description },
        markdown: body,
        properties
      })

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
      } catch (err: any) {
        console.error(
          `[Docs Migration] Failed migrating slug "${slug}" from ${relPath}:`,
          err?.message || err
        )
      }
    }
  }

  console.log(
    `[Docs Migration] Completed migrating ${successCount} doc page records into database.`
  )
}

// Execute if run directly
if (
  import.meta.url === `file://${process.argv[1]?.replace(/\\/g, "/")}` ||
  process.argv.includes("--run")
) {
  migrateDocs()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err)
      process.exit(1)
    })
}
