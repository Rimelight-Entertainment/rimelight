import type { APIRoute } from "astro"
import { renderDefaultOg } from "../og.js"
import * as siteConfigMod from "virtual:rimelight-seo/site-config"
import * as dbMod from "virtual:rimelight-seo/db"
import seoOptions from "virtual:rimelight-seo/options"

export const prerender = false

function getLocalizedText(val: unknown, locale = "en"): string {
  if (typeof val === "object" && val !== null) {
    const record = val as Record<string, string>
    return record[locale] || Object.values(record)[0] || ""
  }
  if (typeof val === "string") return val
  if (typeof val === "number" || typeof val === "boolean") return String(val)
  return ""
}

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url)
  const routeParam = url.pathname.replace(/^\/open-graph\//, "").replace(/\.png$/, "")

  const siteConfig = siteConfigMod.siteConfig || {}
  const ogOpts = typeof seoOptions?.og === "object" ? seoOptions.og : {}

  // Brand: explicit og.brand > seo.name > site.name > hostname
  const brand = ogOpts.brand || (seoOptions as any)?.name || siteConfig.name || url.hostname

  const defaultBg = ogOpts.defaultBackground ?? "dark"
  const docsBg = ogOpts.docsBackground ?? "gradient"

  let title = url.searchParams.get("title") || ""
  let description = url.searchParams.get("description") || ""
  let date = url.searchParams.get("pubDate") || ""
  const badge =
    url.searchParams.get("type") ||
    (routeParam.includes("blog") ? "Blog Post" : routeParam.includes("legal") ? "Legal" : "")

  // DB slug lookup -- same pattern as llms.txt.ts, gracefully skipped when db is absent
  if (!title && routeParam && routeParam !== "page" && routeParam !== "default" && dbMod.db) {
    try {
      const { pages: pagesTable } = await import("#db/schema").catch(() => ({ pages: null }))
      const { eq, and, isNull } = await import("drizzle-orm")

      if (pagesTable) {
        const slug = routeParam.split("/").pop() ?? ""
        const page = await dbMod.db
          .select({
            title: pagesTable.title,
            description: pagesTable.description,
            postedAt: pagesTable.postedAt
          })
          .from(pagesTable)
          .where(and(eq(pagesTable.slug, slug), isNull(pagesTable.deletedAt)))
          .limit(1)
          .then((r: any[]) => r[0])
          .catch(() => undefined)

        if (page) {
          title = getLocalizedText(page.title)
          description = description || getLocalizedText(page.description)
          if (page.postedAt && !date) date = new Date(page.postedAt).toLocaleDateString()
        }
      }
    } catch {
      // DB unavailable -- fall through to query-param values
    }
  }

  const isDocs = url.searchParams.get("isDocs") === "true" || routeParam.includes("docs")

  return renderDefaultOg({
    title: title || brand,
    description,
    brand,
    badge,
    date,
    background: isDocs ? docsBg : defaultBg,
    preview: url.searchParams.get("preview") === "1"
  })
}
