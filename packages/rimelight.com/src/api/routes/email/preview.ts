import { Hono } from "hono"
import type { Context } from "hono"

const api = new Hono()

function previewUrl(c: Context, suffix = "") {
  const firstSegment = new URL(c.req.url).pathname.split("/").filter(Boolean)[0]
  const locale = firstSegment === "pt" ? "pt" : "en"
  return `/${locale}/dev/email${suffix}`
}

// Keep the old API URLs working while the previews are served by Astro pages.
api.get("/", (c) => c.redirect(previewUrl(c)))
api.get("/:template", (c) => c.redirect(previewUrl(c, `/${c.req.param("template")}`)))

export default api
