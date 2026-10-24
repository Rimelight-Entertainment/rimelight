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
export * from "./services/index";

// Universal Auth & Pluggable Adapters (RFC-0004 & RFC-0006)
export * from "./auth/permissions";
export * from "./auth/filter-blocks";
export * from "./auth/editor-guards";
export * from "./auth/filter-templates";
export type { AuthAdapter, UserSessionContext, UserType } from "@rimelight/auth";

// Search
export * from "./search/query";

// Database Schemas, Resolvers & Migration
export * from "./schema/index";
export * from "./db/index";

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

// Content & Search Routers
export * from "./server/index";

// Self-Migrator Runner
export * from "./migrator/index";
