import type { APIRoute } from "astro"
import { buildSecurityTxt } from "../security.js"
import * as siteConfigMod from "virtual:rimelight-seo/site-config"
import seoOptions from "virtual:rimelight-seo/options"

export const prerender = false

export const GET: APIRoute = ({ site, url }) => {
  const siteConfig = siteConfigMod.siteConfig || {}
  const siteUrl = site ? site.toString() : siteConfig.url || url.origin
  const secOpts = typeof seoOptions?.security === "object" ? seoOptions.security : {}

  const defaultContact = siteConfig.email ? `mailto:${siteConfig.email}` : undefined
  const contacts =
    secOpts.contact || defaultContact || `mailto:security@${new URL(siteUrl).hostname}`
  const canonical = secOpts.canonical || new URL("/.well-known/security.txt", siteUrl).toString()

  const content = buildSecurityTxt({
    contact: contacts,
    canonical,
    ...secOpts
  })

  return new Response(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800"
    }
  })
}
