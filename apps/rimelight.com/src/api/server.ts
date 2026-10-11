import { Hono } from "hono";
import authRoutes from "./routes/auth";
import searchRoutes from "./routes/search";
import changelogRoutes from "./routes/changelog";
import assetsRoutes from "./routes/assets";
import pagesRoutes from "./routes/pages";
import versionRoutes from "./routes/versions";
import docsRoutes from "./routes/docs";
import contactRoutes from "./routes/contact";

const api = new Hono()
  .route("/auth", authRoutes)
  .route("/search", searchRoutes)
  .route("/github", changelogRoutes)
  .route("/assets", assetsRoutes)
  .route("/pages", pagesRoutes)
  .route("/pages/versions", versionRoutes)
  .route("/docs", docsRoutes)
  .route("/contact", contactRoutes);

export type ApiType = typeof api;
export default api;
