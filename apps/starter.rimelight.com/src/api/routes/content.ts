import { Hono } from "hono"
import { db } from "#db"
import { pages } from "#db/schema"
import { and, desc, eq, inArray, isNull } from "drizzle-orm"
import { renderPageAsMarkdown } from "@rimelight/cms"

function normalizePage(page: any) {
  return Object.assign({}, page, {
    content: typeof page.content === "string" ? JSON.parse(page.content) : page.content
  })
}

const content = new Hono()

// Public list of published pages, optionally filtered by type (?type=blog|doc|legal)
content.get("/pages", async (c) => {
  const type = c.req.query("type") || ""
  try {
    const list = await db
      .select()
      .from(pages)
      .where(type ? and(eq(pages.type, type), isNull(pages.deletedAt)) : isNull(pages.deletedAt))
      .orderBy(desc(pages.postedAt), desc(pages.createdAt))
    return c.json({ pages: list.map(normalizePage) })
  } catch (error: any) {
    console.error("[Content API /pages Error]:", error)
    return c.json({ pages: [] })
  }
})

// Public single page by slug, optionally narrowed by type (?type=legal)
content.get("/pages/:slug", async (c) => {
  const slug = c.req.param("slug")
  const type = c.req.query("type") || ""
  try {
    const results = await db
      .select()
      .from(pages)
      .where(
        type
          ? and(eq(pages.type, type), eq(pages.slug, slug), isNull(pages.deletedAt))
          : and(eq(pages.slug, slug), isNull(pages.deletedAt))
      )
      .limit(1)
    if (!results[0]) return c.json({ page: null }, 404)
    return c.json({ page: normalizePage(results[0]) })
  } catch (error: any) {
    console.error("[Content API /pages/:slug Error]:", error)
    return c.json({ page: null }, 404)
  }
})

// Public doc slugs + versions for version resolution
content.get("/doc-versions", async (c) => {
  try {
    const allDocPages = await db
      .select({ slug: pages.slug, content: pages.content })
      .from(pages)
      .where(and(eq(pages.type, "doc"), isNull(pages.deletedAt)))
    const versions = allDocPages.map((row: any) => {
      const contentObj =
        typeof row.content === "string" ? JSON.parse(row.content) : row.content || {}
      return {
        slug: row.slug,
        version: contentObj?.properties?.version,
        properties: contentObj?.properties
      }
    })
    return c.json({ versions })
  } catch (error: any) {
    console.error("[Content API /doc-versions Error]:", error)
    return c.json({ versions: [] })
  }
})

// Public doc candidates lookup by slug list (?slugs=a,b,c)
content.get("/docs", async (c) => {
  const slugs = (c.req.query("slugs") || "").split(",").filter(Boolean)
  if (slugs.length === 0) return c.json({ pages: [] })
  try {
    const results = await db
      .select()
      .from(pages)
      .where(and(eq(pages.type, "doc"), inArray(pages.slug, slugs), isNull(pages.deletedAt)))
    return c.json({ pages: results.map(normalizePage) })
  } catch (error: any) {
    console.error("[Content API /docs Error]:", error)
    return c.json({ pages: [] })
  }
})

// Public markdown rendering for a doc slug (replaces the Astro .md.ts endpoint)
content.get("/docs/:slug/md", async (c) => {
  let slug = c.req.param("slug") || "index"
  const locale = c.req.query("locale") || "en"
  if (slug.endsWith(".md")) slug = slug.slice(0, -3)

  const candidateSlugs = [slug, slug === "index" ? "overview/getting-started" : `overview/${slug}`]

  try {
    const results = await db
      .select()
      .from(pages)
      .where(
        and(eq(pages.type, "doc"), inArray(pages.slug, candidateSlugs), isNull(pages.deletedAt))
      )

    let dbPage: any = null
    for (const cand of candidateSlugs) {
      const match = results.find((p: any) => p.slug === cand)
      if (match) {
        dbPage = match
        break
      }
    }

    if (!dbPage) return c.text("Not Found", 404)

    const url = new URL(c.req.url)
    const siteUrl = `${url.protocol}//${url.host}`
    const body = renderPageAsMarkdown(dbPage, locale, { siteUrl, llmsUrl: "/llms.txt" })

    return new Response(body, {
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        "Cache-Control": "public, max-age=3600, s-maxage=86400"
      }
    })
  } catch (error: any) {
    console.error("[Content API /docs/:slug/md Error]:", error)
    return c.text("Not Found", 404)
  }
})

export default content
