/**
 * Backwards-compatible CMS integration entry.
 *
 * The legacy Astro integration (`rimelightCms()` returning an AstroIntegration with `injectRoute` /
 * `astro:config:setup`) has been replaced by the framework-agnostic Vite plugin in `./plugin.ts`.
 * Import `cms()` from `@rimelight/cms/plugin` (or `@rimelight/cms`) in Solid + Vite apps.
 *
 * This module keeps the `rimelightCms` name so existing imports keep working, but it now returns a
 * plain Vite plugin instead of an Astro integration.
 */
export { cms, cms as rimelightCms, type RimelightCmsPluginOptions } from "./plugin.ts";
export type { RimelightCmsPluginOptions as RimelightCmsOptions } from "./plugin.ts";
