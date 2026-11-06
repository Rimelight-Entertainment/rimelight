import { Hono } from "hono";
import authRoutes from "./routes/auth";
import changelogRoutes from "./routes/changelog";
import docsRoutes from "./routes/docs";
import v1Routes from "./routes/v1/index";
import serverV1Routes from "./routes/server-v1";

const api = new Hono()
  .route("/auth", authRoutes)
  .route("/github", changelogRoutes)
  .route("/docs", docsRoutes)
  .route("/v1", v1Routes)
  .route("/server/v1", serverV1Routes);

export type ApiType = typeof api;
export default api;
