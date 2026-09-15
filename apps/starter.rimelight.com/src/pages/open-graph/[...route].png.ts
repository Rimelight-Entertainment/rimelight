import type { APIRoute } from "astro"
import { renderDefaultOg } from "@rimelight/seo/og"

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url)
  const routeParam = url.pathname.replace(/^\/open-graph\//, "").replace(/\.png$/, "")

  const title = url.searchParams.get("title") || routeParam || "Rimelight Entertainment"
  const description = url.searchParams.get("description") || ""
  const badge = url.searchParams.get("type") || ""
  const date = url.searchParams.get("pubDate") || ""
  const isDocs = url.searchParams.get("isDocs") === "true" || routeParam.includes("docs")

  return renderDefaultOg({
    title,
    description,
    brand: "Rimelight",
    badge,
    date,
    background: isDocs ? "gradient" : "dark",
    preview: url.searchParams.get("preview") === "1"
  })
}
