import { Hono } from "hono";
import authRoutes from "./routes/auth";
import changelogRoutes from "./routes/changelog";
import assetsRoutes from "./routes/assets";
import docsRoutes from "./routes/docs";
import contactRoutes from "./routes/contact";
import v1Routes from "./routes/v1/index";

const api = new Hono()
  .route("/auth", authRoutes)
  .route("/github", changelogRoutes)
  .route("/assets", assetsRoutes)
  .route("/docs", docsRoutes)
  .route("/contact", contactRoutes)
  .route("/v1", v1Routes);

export type ApiType = typeof api;
export default api;
