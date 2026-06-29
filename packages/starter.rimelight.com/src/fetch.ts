import { Hono } from "hono"
import { actions, pages } from "astro/hono"
import api from "@/api"
import { ratelimit } from "./middleware/ratelimit"
import { i18n } from "./middleware/i18n"
import { security } from "./middleware/security"
import { auth } from "./middleware/auth"
import { construction } from "./middleware/construction"

const app = new Hono()

// Rate Limit
app.use(ratelimit)

// Localization
app.use(i18n)

// Security
app.use(security)

// Auth
app.use(auth)

// Construction Mode
app.use(construction)

// Routing
app.route("/api", api)

// Astro Lifecycle
app.use(actions())
app.use(pages())

export default app
