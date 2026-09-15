import type { APIRoute } from "astro"
import { buildRobotsTxt } from "../robots.js"
import seoConfig from "virtual:rimelight-seo-config"

export const GET: APIRoute = ({ site }) => {
  const sitemapURL = site ? new URL("sitemap.xml", site).toString() : ""
  const robotsOpts = typeof seoConfig?.robots === "object" ? seoConfig.robots : {}
  const robots = buildRobotsTxt({
    sitemapUrl: sitemapURL,
    allow: ["/"],
    ...robotsOpts
  })

  return new Response(robots, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400"
    }
  })
}
