import type { APIRoute } from "astro"
import { buildLlmsTxt } from "../llms.js"
import seoConfig from "virtual:rimelight-seo-config"

export const GET: APIRoute = ({ site }) => {
  const llmsOpts = typeof seoConfig?.llms === "object" ? seoConfig.llms : {}
  const siteStr = site ? site.toString().replace(/\/$/, "") : ""
  const hostname = site ? new URL(site).hostname : "Site"
  const content = buildLlmsTxt({
    site: siteStr,
    title: hostname,
    pages: [],
    ...llmsOpts
  })

  return new Response(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400"
    }
  })
}
