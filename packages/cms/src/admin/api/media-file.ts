/**
 * CMS media file proxy (framework-agnostic).
 *
 * Call `handleMediaFile(request, key, ctx)` from any router — e.g.
 * Hono: `app.get("/cms/api/media/file/:key", (c) => handleMediaFile(c.req.raw, c.req.param("key"),
 * ctx))`.
 */
export { handleMediaFile as GET, type MediaRouteContext } from "../../server/media";
