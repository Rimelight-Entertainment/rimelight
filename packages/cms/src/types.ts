import type { StorageConfig } from "./storage/index";
import type { CmsAccessConfig } from "./auth/access";
import type { Component } from "solid-js";
import type { BlockDefinition } from "./core/blocks/registry";

/**
 * Site-level CMS configuration, written in `cms.config.ts` at the app root and loaded by the
 * Vite plugin through `virtual:rimelight-cms`. Both the server middleware and the dashboard
 * read it, so custom blocks (with their Solid renderers/editors) are shared. Collections,
 * taxonomies and templates live in the database and are created in the CMS.
 */
export interface CmsConfig {
  /** Custom blocks in addition to the built-ins. */
  blocks?: BlockDefinition<any>[];
  /** Solid renderers by block type, for built-in or custom blocks whose renderer the site supplies. */
  renderers?: Record<string, Component<any>>;
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
  /** Who may use the CMS: how verified sign-ins are provisioned and mapped to roles. */
  access?: CmsAccessConfig;
}

export function defineCmsConfig(config: CmsConfig): CmsConfig {
  return config;
}
