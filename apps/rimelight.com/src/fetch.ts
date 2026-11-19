import { Hono } from "hono";
import { security } from "@rimelight/security/middleware";
import { auth } from "@rimelight/auth/middleware";
import { seo } from "@rimelight/seo/middleware";
import { cms } from "@rimelight/cms/middleware";
import { i18n } from "@rimelight/i18n/middleware";
import api from "#api/server";
import space from "./space/api.ts";
import { handleRequest } from "virtual:solid-ssr-handler";

const app = new Hono<{ Bindings: Env }>();

// Rimelight Space API: registered before the site middleware, so its traffic skips the site's rate limits.
app.route("/v1", space);

app.use(security());
app.use(auth());
app.use(seo());
app.use(cms());
app.use(i18n());

app.route("/api", api);

app.all("*", (c) => handleRequest(c.req.raw));

export default app;

// The Durable Object class must be exported from the Worker's entry module (Space CV.3, decision 0045).
export { CanvasRoom } from "./space/canvas-room.ts";
