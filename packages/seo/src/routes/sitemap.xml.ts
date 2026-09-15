import type { APIRoute } from "astro"
import { buildSitemapXml } from "../sitemap.js"
import seoConfig from "virtual:rimelight-seo-config"

export const GET: APIRoute = () => {
  const sitemapOpts = typeof seoConfig?.sitemap === "object" ? seoConfig.sitemap : {}
  const urls = sitemapOpts.urls || []
  const xml = buildSitemapXml(urls)

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400"
    }
  })
}
