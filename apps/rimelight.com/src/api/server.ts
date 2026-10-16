import { Hono } from "hono";
import authRoutes from "./routes/auth";
import searchRoutes from "./routes/search";
import changelogRoutes from "./routes/changelog";
import assetsRoutes from "./routes/assets";
import docsRoutes from "./routes/docs";
import contactRoutes from "./routes/contact";
import contentRoutes from "./routes/content";

const api = new Hono()
  .route("/auth", authRoutes)
  .route("/search", searchRoutes)
  .route("/github", changelogRoutes)
  .route("/assets", assetsRoutes)
  .route("/docs", docsRoutes)
  .route("/contact", contactRoutes)
  .route("/content", contentRoutes);

export type ApiType = typeof api;
export default api;
