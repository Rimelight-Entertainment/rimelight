import { Hono } from "hono"
import authRoutes from "./routes/auth"
import searchRoutes from "./routes/search"
import changelogRoutes from "./routes/changelog"
import assetsRoutes from "./routes/assets"
import pagesRoutes from "./routes/pages"
import versionRoutes from "./routes/versions"
import emailPreviewRoutes from "./routes/email/preview"
import docsRoutes from "./routes/docs"
import cmsRoutes from "./routes/cms"

const api = new Hono()
  .route("/auth", authRoutes)
  .route("/search", searchRoutes)
  .route("/github", changelogRoutes)
  .route("/assets", assetsRoutes)
  .route("/pages", pagesRoutes)
  .route("/pages/versions", versionRoutes)
  .route("/dev/email/preview", emailPreviewRoutes)
  .route("/docs", docsRoutes)
  .route("/cms", cmsRoutes)

export type ApiType = typeof api
export default api
