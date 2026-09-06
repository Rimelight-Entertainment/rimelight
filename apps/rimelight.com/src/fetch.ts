import { Hono } from "hono"
import { security, devOnly } from "@rimelight/security/middleware"
import { ratelimit } from "#api/middleware/ratelimit"
import { authMiddleware } from "#api/middleware/auth"
import { construction } from "#api/middleware/construction"
import api from "#api"
import { i18n } from "@rimelight/i18n/hono"
import { getRelativeLocaleUrl } from "@rimelight/i18n"
import { astro } from "astro/hono"

const app = new Hono()

// Middlewares
app.use(security())
app.use(ratelimit)
app.use(authMiddleware)
app.use(construction)
app.use(devOnly)

// Hono API Routing
app.route("/api", api)

// Localization & Astro Pipeline
app.use(i18n())
app.use(astro())

// Global Error Handler
app.onError((err, c) => {
  console.error("[Hono Server Error]", err)
  const isHtml = (c.req.header("accept") || "").includes("text/html")
  if (isHtml) {
    return c.redirect(getRelativeLocaleUrl("/500"), 302)
  }
  return c.json({ error: "Internal Server Error", message: err.message }, 500)
})

export default app
