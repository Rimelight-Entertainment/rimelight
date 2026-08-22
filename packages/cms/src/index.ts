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
export * from "./services/component-metadata.ts"

// Auth & Security Guards
export * from "./auth/permissions.ts"
export * from "./auth/filter-blocks.ts"
export * from "./auth/editor-guards.ts"
export * from "./auth/filter-templates.ts"

// Edge Cache & Search
export * from "./cache/purge.ts"
export * from "./search/query.ts"

// Database Schemas & Migration
export * from "./schema/index.ts"

// Astro Components
export { default as PageRenderer } from "./astro/PageRenderer.astro"
export { default as BlockRenderer } from "./astro/BlockRenderer.astro"

// Toast API
export * from "./client/toast.ts"
