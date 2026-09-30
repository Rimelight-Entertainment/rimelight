import { Hono } from "hono";
import { handleRequest } from "virtual:solid-ssr-handler";
import { security, devOnly, ratelimit, construction } from "@rimelight/security/middleware";
import { auth } from "@rimelight/auth/middleware";
import api from "#api";
import { i18n } from "@rimelight/i18n/middleware";
import { getRelativeLocaleUrl } from "@rimelight/i18n";

const app = new Hono<{ Bindings: Env }>();

// Middlewares
app.use(security());
app.use(devOnly);
app.use(ratelimit());
app.use(construction());
app.use(
  auth({
    roleGuards: {
      "/internal": {
        roles: ["employee", "staff", "admin", "owner"],
        userTypes: ["employee"],
      },
      "/api/internal": {
        roles: ["employee", "staff", "admin", "owner"],
        userTypes: ["employee"],
      },
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
  fetch: app.fetch,
};
