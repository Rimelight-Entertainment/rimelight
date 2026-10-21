import { Hono } from "hono";
import authRoutes from "./routes/auth";
import changelogRoutes from "./routes/changelog";
import assetsRoutes from "./routes/assets";
import docsRoutes from "./routes/docs";
import contactRoutes from "./routes/contact";

const api = new Hono()
  .route("/auth", authRoutes)
  .route("/github", changelogRoutes)
  .route("/assets", assetsRoutes)
  .route("/docs", docsRoutes)
  .route("/contact", contactRoutes);

export type ApiType = typeof api;
export default api;
