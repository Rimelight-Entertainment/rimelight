import type { APIRoute } from "astro"
import { buildApiCatalog } from "../catalog.js"
import type { ApiCatalogItem } from "../types.js"
import seoOptions from "virtual:rimelight-seo/options"

export const prerender = false

export const GET: APIRoute = () => {
  const catalogOpts = typeof seoOptions?.apiCatalog === "object" ? seoOptions.apiCatalog : {}

  const defaultItems: ApiCatalogItem[] = [
    {
      rel: "self",
      href: "/.well-known/api-catalog",
      type: "application/linkset+json"
    }
  ]

  if (seoOptions?.sitemap !== false) {
    defaultItems.push({
      rel: "alternate",
      href: "/sitemap.xml",
      type: "application/xml",
      title: "Sitemap"
    })
  }

  if (seoOptions?.rss !== false) {
    defaultItems.push({
      rel: "alternate",
      href: "/rss.xml",
      type: "application/rss+xml",
      title: "RSS Feed"
    })
  }

  if (seoOptions?.llms !== false) {
    defaultItems.push({
      rel: "llms",
      href: "/llms.txt",
      type: "text/plain",
      title: "LLMs.txt"
    })
  }

  const items = catalogOpts.items || defaultItems
  const catalog = buildApiCatalog({ items })

  return new Response(JSON.stringify(catalog, null, 2), {
    headers: {
      "Content-Type": "application/linkset+json; charset=utf-8",
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800"
    }
  })
}
