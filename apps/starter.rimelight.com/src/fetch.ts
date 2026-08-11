import { Hono } from "hono"
import { security } from "@/api/middleware/security"
import { ratelimit } from "@/api/middleware/ratelimit"
import { auth } from "@/api/middleware/auth"
import { construction } from "@/api/middleware/construction"
import { devOnly } from "@rimelight/security/middleware"
import api from "@/api"
import { i18n } from "@/api/middleware/i18n"
import { actions, pages, middleware, sessions, cache } from "astro/hono"

const app = new Hono()

// 1. Security Middleware
app.use(security)

// 2. Rate Limiting Middleware
app.use(ratelimit)

// 3. Auth Middleware
app.use(auth)

// 4. Construction Mode Middleware
app.use(construction)

// 5. Dev-only guard (blocks /dev/ routes and /api/dev/ routes in production)
app.use(devOnly)

// 6. Hono API Routing
app.route("/api", api)

// 7. Localization & Routing Middleware
app.use(i18n)

// 8. Astro Pipeline Handlers
app.use(middleware())
app.use(sessions())
app.use(actions())
app.use(pages())
app.use(cache())

export default app
