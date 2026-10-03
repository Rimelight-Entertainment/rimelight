import { cmsRouter } from "./router.ts";

export {
  handleMediaList,
  handleMediaUpload,
  handleMediaDelete,
  handleMediaFile,
  registerCmsMediaRoutes,
  type MediaRouteContext,
} from "./media.ts";

export { createCmsRouter, cmsRouter, type CmsRouterOptions } from "./router.ts";

export default cmsRouter;
