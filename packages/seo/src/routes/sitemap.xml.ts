import type { APIRoute } from "astro"
import { buildSitemapUrls, buildSitemapXml } from "../sitemap.js"
import * as seoConfig from "virtual:rimelight-seo/config"
import * as siteConfigMod from "virtual:rimelight-seo/site-config"
import seoOptions from "virtual:rimelight-seo/options"

export const GET: APIRoute = async ({ site, url }) => {
  const sitemapOpts = typeof seoOptions?.sitemap === "object" ? seoOptions.sitemap : {}
  const siteUrl = site ? site.toString() : siteConfigMod.siteConfig?.url || url.origin

  let entries: any[] = []
  if (typeof sitemapOpts.entries === "function") {
    entries = await sitemapOpts.entries()
  } else if (typeof seoConfig.seoEntries === "function") {
    entries = await seoConfig.seoEntries()
  }

  const locales =
    sitemapOpts.locales ||
    seoConfig.SEO_LOCALES ||
    (siteUrl
      ? {
          site: siteUrl.replace(/\/$/, ""),
          locales: { en: "en-US" },
          defaultLocale: "en",
          trailingSlash: "never" as const
        }
      : undefined)

  let urls = sitemapOpts.urls || []
  if (urls.length === 0 && entries.length > 0 && locales) {
    urls = buildSitemapUrls(entries, locales)
  }

  const xml = buildSitemapXml(urls)

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400"
    }
  })
}
