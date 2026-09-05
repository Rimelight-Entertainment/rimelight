import { db } from "#db"
import { pages } from "#db/schema"
import { and, eq, inArray, isNull } from "drizzle-orm"
import { renderPageAsMarkdown } from "@rimelight/cms"

export const prerender = false

export async function GET(context: {
  params: { locale?: string; slug?: string }
  url: URL
  site?: URL
}) {
  const locale = context.params.locale || "en"
  let slug = context.params.slug || "index"

  // Strip trailing .md if included in param
  if (slug.endsWith(".md")) {
    slug = slug.slice(0, -3)
  }

  const candidateSlugs = [slug, slug === "index" ? "overview/getting-started" : `overview/${slug}`]

  let dbPage: any = null
  try {
    const results = await db
      .select()
      .from(pages)
      .where(
        and(eq(pages.type, "doc"), inArray(pages.slug, candidateSlugs), isNull(pages.deletedAt))
      )

    for (const cand of candidateSlugs) {
      const match = results.find((p: any) => p.slug === cand)
      if (match) {
        dbPage = match
        break
      }
    }
  } catch {
    // continue
  }

  if (!dbPage) {
    return new Response("Not Found", { status: 404 })
  }

  const siteUrl = context.site?.toString() || `${context.url.protocol}//${context.url.host}`
  const body = renderPageAsMarkdown(dbPage, locale, { siteUrl, llmsUrl: "/llms.txt" })

  return new Response(body, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400"
    }
  })
}
