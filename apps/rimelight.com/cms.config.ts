import { defineCmsConfig } from "@rimelight/cms/blocks";
import { siteBlockRenderers } from "#components/blocks";

/**
 * Rimelight-specific CMS setup. Screenplay and docs blocks are package built-ins; the site only
 * supplies the renderers for the two built-ins that need site code (API documentation and live
 * preview). Collections (including the franchise types) are created in the CMS dashboard and
 * stored in the database.
 */
export default defineCmsConfig({
  locales: ["en", "pt", "es"],
  renderers: siteBlockRenderers,
});
