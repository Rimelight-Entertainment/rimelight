import { Hono } from "hono";
import { handleRequest } from "virtual:solid-ssr-handler";
import { security } from "@rimelight/security/middleware";
import { auth } from "@rimelight/auth/middleware";
import { cms } from "@rimelight/cms/middleware";
import { seo } from "@rimelight/seo/middleware";
import api from "#api/server";
import { i18n } from "@rimelight/i18n/middleware";

const app = new Hono<{ Bindings: Env }>();

// Middlewares
app.use(security());
app.use(auth());
app.use(cms());
app.use(seo());

// Hono API Routing
app.route("/api", api);

// Localization Middleware
app.use(i18n());

// Fall through all unmatched requests to Solid's SSR page renderer
app.all("*", (c) => handleRequest(c.req.raw));

export default app;
