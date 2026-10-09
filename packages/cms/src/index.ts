// Core Types
export * from "./core/types/blocks";
export * from "./core/types/inline";
export * from "./core/types/pages";
export * from "./core/types/templates";
export * from "./core/types/versioning";
export * from "./core/page-definitions";

// Markdown Serialization & Parsing
export * from "./markdown/index";

// Re-export specific types for convenience
export type {
  TimeOfDay,
  Setting,
  Transition,
  ScriptBlockProps,
  SceneBlockProps,
  DialogueBlockProps,
} from "./core/types/blocks";

// Core Services & Registries
export * from "./core/registry";
export * from "./core/validator";

// Universal Auth & Pluggable Adapters (RFC-0004 & RFC-0006)
export * from "./auth/permissions";
export * from "./auth/filter-blocks";
export * from "./auth/editor-guards";
export * from "./auth/filter-templates";
export { cfAccessAuth } from "@rimelight/auth/cf-access";
export { auth0Auth } from "@rimelight/auth/auth0";
export { mockAuth } from "@rimelight/auth/mock";
export { hasRole, hasPermission, evaluateAccess } from "@rimelight/auth";
export type {
  AuthAdapter as CmsAuthAdapter,
  AuthAdapter,
  UserSessionContext,
  UserType,
} from "@rimelight/auth";

// Edge Cache & Search
export * from "./cache/purge";
export * from "./search/query";

// Database Schemas & Migration
export * from "./schema/index";

// Vite Plugin & CMS Integration types (Solid).
//
// The `cms` / `rimelightCms` plugin factories are Node-only (they read from
// `node:fs` / `node:path`), so they are deliberately NOT re-exported from this
// runtime entry point: doing so would drag the Node built-ins into the browser
// bundle. Import them from `@rimelight/cms/plugin` or `@rimelight/cms/integration`
// in your `vite.config.ts` instead. The option types stay re-exported here
// because types are erased at compile time and cost nothing at runtime.
export type { RimelightCmsPlugin, RimelightCmsPluginOptions } from "./plugin";

// Toast API
export * from "./client/toast";

// Excerpts & Summaries
export * from "./core/excerpt";

// Dynamic Site Settings
export * from "./services/site-settings";

// CMS Collection Loader (framework-agnostic)
export * from "./loader/live";

// Cloudflare Worker Cron Dispatcher
export * from "./cron/scheduled";

// Model Context Protocol (MCP) Tools
export * from "./mcp/index";

// Media & Bylines
export * from "./core/types/media";
export * from "./core/types/bylines";
export * from "./services/bylines";

// Preview Tokens & Block Diffs
export * from "./core/preview";
export * from "./core/diff";

// Search Indexer
export * from "./services/search-indexer";

// Taxonomies Engine
export * from "./core/types/taxonomies";
export * from "./services/taxonomies";

// Documentation Engine & Navigation
export * from "./docs/index";

// Storage Adapters (R2, etc.)
export * from "./storage/index";
