import { Hono } from "hono";
import authRoutes from "./routes/auth";
import searchRoutes from "./routes/search";
import contactRoutes from "./routes/contact";
import contentRoutes from "./routes/content";
import uploadRoutes from "./routes/upload";

const api = new Hono()
  .route("/auth", authRoutes)
  .route("/search", searchRoutes)
  .route("/contact", contactRoutes)
  .route("/content", contentRoutes)
  .route("/upload", uploadRoutes);

export type ApiType = typeof api;
export default api;
