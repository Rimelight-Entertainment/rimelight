import { Hono } from "hono"
import { actions, pages } from "astro/hono"
import api from "@/api"
import { i18n } from "@/api/middleware/i18n"
import { security } from "@/api/middleware/security"
import { auth } from "@/api/middleware/auth"
import { construction } from "@/api/middleware/construction"

const app = new Hono()

// 1. Register Hono API Sub-routing
app.route("/api", api)

// 2. Security Headers and SRI injection
app.use(security)

// 3. Security Boundary: Global Auth Middleware
app.use(auth)

// 4. Localization & Routing
app.use(i18n)

// 5. Global Construction Middleware
app.use(construction)

// 6. Astro Lifecycle Execution (Actions and Page rendering)
app.use(actions())
app.use(pages())

export default app
