export {
  handleMediaList,
  handleMediaUpload,
  handleMediaDelete,
  handleMediaFile,
  registerCmsMediaRoutes,
  type MediaRouteContext,
} from "./media";

export { createCmsRouter, cmsRouter, type CmsRouterOptions } from "./router";
export { createContentRouter, contentRouter, type ContentRouterOptions } from "./content";
export { createSearchRouter, searchRouter, type SearchRouterOptions } from "./search";
