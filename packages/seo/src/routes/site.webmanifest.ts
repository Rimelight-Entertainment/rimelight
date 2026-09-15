import type { APIRoute } from "astro"
import { buildWebManifest } from "../manifest.js"
import * as siteConfigMod from "virtual:rimelight-seo/site-config"
import seoOptions from "virtual:rimelight-seo/options"

export const prerender = false

export const GET: APIRoute = () => {
  const siteConfig = siteConfigMod.siteConfig || {}
  const manifestOpts = typeof seoOptions?.manifest === "object" ? seoOptions.manifest : {}

  const manifest = buildWebManifest({
    name: manifestOpts.name || siteConfig.name || "Site",
    shortName: manifestOpts.shortName || siteConfig.name || "Site",
    description: manifestOpts.description || siteConfig.description || "",
    backgroundColor:
      manifestOpts.backgroundColor || siteConfig.branding?.colors?.backgroundColor || "#ffffff",
    themeColor: manifestOpts.themeColor || siteConfig.branding?.colors?.themeColor || "#ffffff",
    ...manifestOpts
  })

  return new Response(JSON.stringify(manifest, null, 2), {
    headers: {
      "Content-Type": "application/manifest+json; charset=utf-8",
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800"
    }
  })
}
