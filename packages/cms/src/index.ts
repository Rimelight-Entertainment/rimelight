// Core Types
export * from "./core/types/blocks"
export * from "./core/types/inline"
export * from "./core/types/pages"
export * from "./core/types/templates"
export * from "./core/types/versioning"
export * from "./core/page-definitions"

// Re-export specific types for convenience
export type {
  TimeOfDay,
  Setting,
  Transition,
  ScriptBlockProps,
  SceneBlockProps,
  DialogueBlockProps
} from "./core/types/blocks"

// Core Services & Registries
export * from "./core/registry"
export * from "./core/validator"
export * from "./core/template-sync"

// Auth & Security Guards
export * from "./auth/permissions"
export * from "./auth/filter-blocks"
export * from "./auth/editor-guards"
export * from "./auth/filter-templates"

// Edge Cache & Search
export * from "./cache/purge"
export * from "./search/query"
export * from "./search/sync"

// Database Schemas & Migration
export * from "./schema/index"
export * from "./migration"

// Astro Components
export { default as PageRenderer } from "./astro/PageRenderer.astro"
export { default as BlockRenderer } from "./astro/BlockRenderer.astro"
