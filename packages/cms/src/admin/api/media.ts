/**
 * CMS media library API (framework-agnostic).
 *
 * Mount the handlers from `../../server/media.ts` in any router — see `registerCmsMediaRoutes()`
 * for Hono-compatible wiring.
 */
export {
  handleMediaList as GET,
  handleMediaUpload as POST,
  handleMediaDelete as DELETE,
  registerCmsMediaRoutes,
  type MediaRouteContext,
} from "../../server/media";
