import { Hono } from "hono";
import searchRoutes from "./routes/search";
import contactRoutes from "./routes/contact";
import contentRoutes from "./routes/content";

const api = new Hono()
  .route("/search", searchRoutes)
  .route("/contact", contactRoutes)
  .route("/content", contentRoutes);

export type ApiType = typeof api;
export default api;
