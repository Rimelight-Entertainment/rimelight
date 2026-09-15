import type { APIRoute } from "astro"
import { buildRobotsTxt } from "../robots.js"
import * as seoConfig from "virtual:rimelight-seo/config"
import * as siteConfigMod from "virtual:rimelight-seo/site-config"
import seoOptions from "virtual:rimelight-seo/options"

export const GET: APIRoute = ({ site, url }) => {
  const siteUrl = site ? site.toString() : siteConfigMod.siteConfig?.url || url.origin
  const sitemapURL = new URL("sitemap.xml", siteUrl).toString()

  const defaultPrivatePrefixes = [
    "/dashboard",
    "/admin",
    "/cms",
    "/internal",
    "/api",
    "/dev",
    "/og",
    "/open-graph",
    "/auth"
  ]

  const customPrivatePrefixes = Array.isArray(seoConfig.PRIVATE_PATH_PREFIXES)
    ? seoConfig.PRIVATE_PATH_PREFIXES
    : []

  const privatePrefixes = Array.from(new Set([...defaultPrivatePrefixes, ...customPrivatePrefixes]))

  const disallowPatterns = [
    ...privatePrefixes,
    ...privatePrefixes.map((p) => `/*${p.startsWith("/") ? p : `/${p}`}/`)
  ]

  const robotsOpts = typeof seoOptions?.robots === "object" ? seoOptions.robots : {}

  const defaultAgentRules = [
    {
      userAgent: "GPTBot",
      disallow: privatePrefixes.map((p) => `${p.startsWith("/") ? p : `/${p}`}/`),
      allow: ["/"]
    },
    {
      userAgent: "ClaudeBot",
      disallow: privatePrefixes.map((p) => `${p.startsWith("/") ? p : `/${p}`}/`),
      allow: ["/"]
    }
  ]

  const robots = buildRobotsTxt({
    sitemapUrl: sitemapURL,
    disallow: disallowPatterns,
    allow: ["/"],
    userAgentRules: defaultAgentRules,
    ...robotsOpts
  })

  return new Response(robots, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400"
    }
  })
}
