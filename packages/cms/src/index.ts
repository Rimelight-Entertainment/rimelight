// Core Types
export * from "./core/types/blocks.ts"
export * from "./core/types/inline.ts"
export * from "./core/types/pages.ts"
export * from "./core/types/templates.ts"
export * from "./core/types/versioning.ts"
export * from "./core/page-definitions.ts"

// Markdown Serialization & Parsing
export * from "./markdown/index.ts"

// Re-export specific types for convenience
export type {
  TimeOfDay,
  Setting,
  Transition,
  ScriptBlockProps,
  SceneBlockProps,
  DialogueBlockProps
} from "./core/types/blocks.ts"

// Core Services & Registries
export * from "./core/registry.ts"
export * from "./core/validator.ts"

// Universal Auth & Pluggable Adapters (RFC-0004 & RFC-0006)
export * from "./auth/permissions.ts"
export * from "./auth/filter-blocks.ts"
export * from "./auth/editor-guards.ts"
export * from "./auth/filter-templates.ts"
export {
  cfAccessAuth,
  auth0Auth,
  mockAuth,
  hasRole,
  hasPermission,
  evaluateAccess
} from "@rimelight/auth"
export type {
  AuthAdapter as CmsAuthAdapter,
  AuthAdapter,
  UserSessionContext,
  UserType
} from "@rimelight/auth"

// Edge Cache & Search
export * from "./cache/purge.ts"
export * from "./search/query.ts"

// Database Schemas & Migration
export * from "./schema/index.ts"

// Astro Integration & Components
export { rimelightCms, type RimelightCmsOptions } from "./integration.ts"

// Toast API
export * from "./client/toast.ts"

// Excerpts & Summaries
export * from "./core/excerpt.ts"

// Dynamic Site Settings
export * from "./services/site-settings.ts"

// Astro Live Loader & Collections
export * from "./loader/live.ts"

// Cloudflare Worker Cron Dispatcher
export * from "./cron/scheduled.ts"

// Model Context Protocol (MCP) Tools
export * from "./mcp/index.ts"

// Media & Bylines
export * from "./core/types/media.ts"
export * from "./core/types/bylines.ts"
export * from "./services/bylines.ts"

// Preview Tokens & Block Diffs
export * from "./core/preview.ts"
export * from "./core/diff.ts"

// Search Indexer
export * from "./services/search-indexer.ts"

// Taxonomies Engine
export * from "./core/types/taxonomies.ts"
export * from "./services/taxonomies.ts"

// Documentation Engine & Navigation
export * from "./docs/index.ts"

// Storage Adapters (R2, etc.)
export * from "./storage/index.ts"
