import { Hono } from "hono"
import { security } from "@/api/middleware/security"
import { ratelimit } from "@/api/middleware/ratelimit"
import { auth } from "@/api/middleware/auth"
import { construction } from "@/api/middleware/construction"
import { devOnly } from "@rimelight/security/middleware"
import api from "@/api"
import { i18n } from "@/api/middleware/i18n"
import { astro } from "astro/hono"

const app = new Hono()

// Middlewares
app.use(security)
app.use(ratelimit)
app.use(auth)
app.use(construction)
app.use(devOnly)

// Hono API Routing
app.route("/api", api)

// Localization & Astro Pipeline
app.use(i18n)
app.use(astro())

export default app
