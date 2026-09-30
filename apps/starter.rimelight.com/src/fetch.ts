import { Hono } from "hono";
import { handleRequest } from "virtual:solid-ssr-handler";
import { security, devOnly, ratelimit, construction } from "@rimelight/security/middleware";
import { auth } from "@rimelight/auth/middleware";
import api from "#api";
import { i18n } from "@rimelight/i18n/middleware";
import { getRelativeLocaleUrl } from "@rimelight/i18n";
import { handleCmsCron } from "@rimelight/cms/cron/scheduled";
import { db } from "#db";

const app = new Hono<{ Bindings: Env }>();

// Export Durable Object classes bound in wrangler.jsonc
export { ChatRoom, Document } from "./chat/durableObject";

// Middlewares
app.use(security());
app.use(devOnly);
app.use(ratelimit());
app.use(construction());
app.use(
  auth({
    roleGuards: {
      "/admin": ["admin", "owner"],
    },
  }),
);

// Hono API Routing
app.route("/api", api);

// Localization Middleware
app.use(i18n());

// Fall through all unmatched requests to Solid's SSR page renderer
app.all("*", (c) => handleRequest(c.req.raw));

// Global Error Handler
app.onError((err, c) => {
  console.error("[Hono Server Error]", err);
  const isHtml = (c.req.header("accept") || "").includes("text/html");
  if (isHtml) {
    return c.redirect(getRelativeLocaleUrl("/500"), 302);
  }
  return c.json({ error: "Internal Server Error", message: err.message }, 500);
});

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
    const url = new URL(request.url);
    if (url.pathname.startsWith("/api/chat/")) {
      const id = url.pathname.split("/").pop();
      if (!id) {
        return new Response("Missing room id", { status: 400 });
      }

      const upgradeHeader = request.headers.get("Upgrade");
      if (upgradeHeader?.toLowerCase() !== "websocket") {
        return new Response("Expected WebSocket upgrade", { status: 426 });
      }

      const chatRoomNamespace = env.ChatRoom;
      if (!chatRoomNamespace) {
        return new Response("ChatRoom Durable Object namespace not bound", { status: 500 });
      }

      const chatRoomId = chatRoomNamespace.idFromName(id);
      const chatRoomStub = chatRoomNamespace.get(chatRoomId);

      return chatRoomStub.fetch(request);
    }

    // Pass everything else through the Hono pipeline
    return app.fetch(request, env, ctx);
  },

  async scheduled(event: ScheduledController, env: Env, ctx: ExecutionContext) {
    ctx.waitUntil(handleCmsCron(event, env, ctx, db));
  },
};
