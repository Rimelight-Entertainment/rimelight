import { Hono } from "hono"
import { cf } from "@astrojs/cloudflare/hono"
import { security, devOnly, construction, ratelimit } from "@rimelight/security/middleware"
import { authMiddleware } from "@rimelight/auth/middleware"
import { auth } from "@rimelight/auth"
import { i18n } from "@rimelight/i18n/hono"
import { handleCmsCron } from "@rimelight/cms/cron/scheduled"
import api from "#api"
import { astro } from "astro/hono"
import { db } from "#db"

// Export the Durable Object classes that wrangler.jsonc binds
export { ChatRoom, Document } from "./chat/durableObject"

const app = new Hono<{ Bindings: Env }>()

// Middlewares
app.use(cf())
app.use(security())
app.use(ratelimit())
app.use(
  authMiddleware({
    auth,
    roleGuards: {
      "/admin": ["admin", "owner"]
    }
  })
)
app.use(construction())
app.use(devOnly)

// Hono API Routing
app.route("/api", api)

// Localization & Astro Pipeline
app.use(i18n())
app.use(astro())

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url)
    if (url.pathname.startsWith("/api/chat/")) {
      const id = url.pathname.split("/").pop()
      if (!id) {
        return new Response("Missing room id", { status: 400 })
      }

      const upgradeHeader = request.headers.get("Upgrade")
      if (upgradeHeader?.toLowerCase() !== "websocket") {
        return new Response("Expected WebSocket upgrade", { status: 426 })
      }

      const chatRoomNamespace = env.ChatRoom
      if (!chatRoomNamespace) {
        return new Response("ChatRoom Durable Object namespace not bound", { status: 500 })
      }

      const chatRoomId = chatRoomNamespace.idFromName(id)
      const chatRoomStub = chatRoomNamespace.get(chatRoomId)

      return chatRoomStub.fetch(request)
    }

    // Pass everything else through the Hono pipeline
    return app.fetch(request, env, ctx)
  },

  async scheduled(event, env, ctx) {
    ctx.waitUntil(handleCmsCron(event, env, ctx, db))
  }
} satisfies ExportedHandler<Env>
