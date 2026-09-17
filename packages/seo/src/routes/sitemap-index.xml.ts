import type { APIRoute } from "astro"
import { buildSitemapIndexXml } from "../sitemap.js"
import * as siteConfigMod from "virtual:rimelight-seo/site-config"
import seoOptions from "virtual:rimelight-seo/options"

export const GET: APIRoute = ({ site, url }) => {
  const siteUrl = site ? site.toString() : siteConfigMod.siteConfig?.url || url.origin

  const sitemapOpts = typeof seoOptions?.sitemap === "object" ? seoOptions.sitemap : {}
  const sitemapPattern = typeof sitemapOpts.path === "string" ? sitemapOpts.path : "/sitemap.xml"

  const xml = buildSitemapIndexXml([new URL(sitemapPattern, siteUrl).toString()])

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400"
    }
  })
}
