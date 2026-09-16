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

api.route("/auth", authRoutes)
api.route("/search", searchRoutes)

api.route("/github", changelogRoutes)
api.route("/assets", assetsRoutes)
api.route("/pages", pagesRoutes)
api.route("/pages/versions", versionRoutes)
api.route("/dev/email/preview", emailPreviewRoutes)
api.route("/docs", docsRoutes)
api.route("/cms", cmsRoutes)

export default api
