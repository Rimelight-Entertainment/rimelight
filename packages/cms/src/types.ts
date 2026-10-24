import type { StorageConfig } from "./storage/index";
import type { AuthAdapter } from "@rimelight/auth";
import type { CollectionDefinition } from "./core/collections/types";
import type { BlockDefinition } from "./core/blocks/registry";
import type { TaxonomyDefinition } from "./core/types/taxonomies";
import type { TemplateInput } from "./services/templates";

/**
 * Site-level CMS configuration, written in `cms.config.ts` at the app root and loaded by the
 * Vite plugin through `virtual:rimelight-cms`. Both the server middleware and the dashboard
 * read it, so custom collections and blocks (with their Solid renderers/editors) are shared.
 */
export interface CmsConfig {
  /** Content models in addition to the built-ins (page, doc, wiki, blog, legal). */
  collections?: CollectionDefinition[];
  /** Custom blocks in addition to the built-ins. */
  blocks?: BlockDefinition<any>[];
  /** Taxonomies in addition to `category` and `tag`. */
  taxonomies?: TaxonomyDefinition[];
  /** Templates seeded on first run (existing slugs are left alone). */
  templates?: TemplateInput[];
  /** Content locales. First is the default. */
  locales?: string[];
  storage?: StorageConfig;
}

/** Options passed to the `cms()` Vite plugin. Must be JSON-serializable. */
export interface CmsPluginOptions {
  /** Path to the config module, relative to the Vite root. Default: `cms.config.ts` if present. */
  config?: string;
  /** Dashboard mount path. Default `/cms` (and `/:locale/cms`). */
  dashboardPath?: string;
  /** API mount path. Default `/api/cms`. */
  apiPath?: string;
  /** Run pending CMS migrations on the first API request after start. */
  autoMigrate?: boolean;
  /** Allow unauthenticated access as an admin in development. Never enabled in production builds. */
  devBypassAuth?: boolean;
  storage?: StorageConfig;
  auth?: AuthAdapter | string;
  /** @deprecated use `dashboardPath` */
  routePrefix?: string;
}

export function defineCmsConfig(config: CmsConfig): CmsConfig {
  return config;
}
