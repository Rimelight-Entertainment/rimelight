import type { APIRoute } from "astro"
import { buildWebManifest } from "../manifest.js"
import * as siteConfigMod from "virtual:rimelight-seo/site-config"
import seoOptions from "virtual:rimelight-seo/options"

export const prerender = false

export const GET: APIRoute = () => {
  const siteConfig = siteConfigMod.siteConfig || {}
  const manifestOpts = typeof seoOptions?.manifest === "object" ? seoOptions.manifest : {}

  let defaultIcons = manifestOpts.icons || siteConfig.branding?.icons
  if (!defaultIcons) {
    const faviconUrl =
      siteConfig.branding?.favicon?.svg ||
      siteConfig.branding?.favicon ||
      siteConfig.branding?.appleTouchIcon
    if (
      typeof faviconUrl === "string" &&
      (faviconUrl.startsWith("http://") ||
        faviconUrl.startsWith("https://") ||
        faviconUrl.startsWith("/"))
    ) {
      const isSvg = faviconUrl.endsWith(".svg")
      defaultIcons = [
        {
          src: faviconUrl,
          sizes: isSvg ? "any" : "192x192",
          type: isSvg ? "image/svg+xml" : "image/png",
          purpose: "any"
        }
      ]
    }
  }

  const manifest = buildWebManifest({
    name: manifestOpts.name || siteConfig.name || "Site",
    shortName: manifestOpts.shortName || siteConfig.name || "Site",
    description: manifestOpts.description || siteConfig.description || "",
    backgroundColor:
      manifestOpts.backgroundColor || siteConfig.branding?.colors?.backgroundColor || "#ffffff",
    themeColor: manifestOpts.themeColor || siteConfig.branding?.colors?.themeColor || "#ffffff",
    icons: defaultIcons,
    ...manifestOpts
  })

  return new Response(JSON.stringify(manifest, null, 2), {
    headers: {
      "Content-Type": "application/manifest+json; charset=utf-8",
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800"
    }
  })
}
