import { Hono } from "hono";
import { security } from "@rimelight/security/middleware";
import { seo } from "@rimelight/seo/middleware";
import { cms } from "@rimelight/cms/middleware";
import { i18n } from "@rimelight/i18n/middleware";
import api from "#api/server";
import { identify } from "#auth/identity";
import { ambientEnv, getAuth0Config } from "#auth/auth0";
import { getSession } from "#auth/session";
import space from "./space/api.ts";
import { handleRequest } from "virtual:solid-ssr-handler";

const app = new Hono<{ Bindings: Env }>();

// Rimelight Space API: registered before the site middleware, so its traffic skips the site's rate limits.
app.route("/v1", space);

app.use(security());

// Sign-in pages are for visitors: signed-in users go home, and bare /auth goes to sign-in.
app.use(async (c, next) => {
  const pathname = new URL(c.req.url).pathname;
  if (pathname === "/auth") return c.redirect("/auth/sign-in");
  if (pathname.includes("/auth/sign-in") || pathname.includes("/auth/sign-up")) {
    const session = await getSession(c.req.raw, getAuth0Config(ambientEnv())).catch(() => null);
    if (session) return c.redirect("/");
  }
  return next();
});

app.use(seo());
app.use(cms({ identify }));
app.use(i18n());

app.route("/api", api);

app.all("*", (c) => handleRequest(c.req.raw));

export default app;

// The Durable Object class must be exported from the Worker's entry module (Space CV.3, decision 0045).
export { CanvasRoom } from "./space/canvas-room.ts";
export { DocRoom } from "./space/content/doc-room.ts";
