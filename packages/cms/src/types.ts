import type { Component } from "solid-js";
import type { BlockDefinition } from "./core/blocks/registry";

/**
 * Site-level CMS configuration, written in `cms.config.ts` at the app root and loaded by the
 * Vite plugin through `virtual:rimelight-cms`. The delivery API and the site renderer both read it,
 * so custom blocks (with their Solid renderers) are shared. Collections, taxonomies and templates
 * live in the database; content is edited in Rimelight Space (decision 0049).
 */
export interface CmsConfig {
  /** Custom blocks in addition to the built-ins. */
  blocks?: BlockDefinition<any>[];
  /** Solid renderers by block type, for built-in or custom blocks whose renderer the site supplies. */
  renderers?: Record<string, Component<any>>;
  /** Content locales. First is the default. */
  locales?: string[];
}

/** Options passed to the `cms()` Vite plugin. Must be JSON-serializable. */
export interface CmsPluginOptions {
  /** Path to the config module, relative to the Vite root. Default: `cms.config.ts` if present. */
  config?: string;
  /** Public API mount path. Default `/api/cms`. */
  apiPath?: string;
  /** Run pending CMS migrations on the first API request after start. */
  autoMigrate?: boolean;
}

export function defineCmsConfig(config: CmsConfig): CmsConfig {
  return config;
}
