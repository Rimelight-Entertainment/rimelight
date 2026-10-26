// ─── Content model ───────────────────────────────────────────────────────────
export * from "./core/types/blocks";
export * from "./core/types/inline";
export * from "./core/richtext";
export * from "./core/types/pages";
export * from "./core/types/templates";
export * from "./core/types/versioning";
export * from "./core/types/media";
export * from "./core/types/bylines";
export * from "./core/types/taxonomies";
export * from "./core/collections/index";
export * from "./core/taxonomies/presets";
export * from "./core/blocks/registry";
export * from "./core/blocks/builtins";
export * from "./core/blocks/tree";
export * from "./core/blocks/embed";
export { defineCmsConfig, type CmsConfig, type CmsPluginOptions } from "./types";

// ─── Services (the CMS API) ──────────────────────────────────────────────────
export * from "./services/index";

// ─── Utilities ───────────────────────────────────────────────────────────────
export * from "./markdown/index";
export * from "./core/excerpt";
export * from "./core/preview";
export * from "./core/diff";
export * from "./auth/permissions";
export * from "./auth/filter-blocks";
export * from "./auth/editor-guards";
export * from "./auth/filter-templates";
export type { AuthAdapter, UserSessionContext, UserType } from "@rimelight/auth";

// ─── Docs engine ─────────────────────────────────────────────────────────────
export * from "./docs/index";

// ─── Delivery ────────────────────────────────────────────────────────────────
export * from "./cron/scheduled";
export * from "./mcp/index";
export * from "./storage/index";
export * from "./server/index";

// ─── Database ────────────────────────────────────────────────────────────────
export * from "./schema/index";
export { getCmsDb, detectDialect, tablesFor, type Dialect, type CmsTables } from "./db/index";
export * from "./migrator/index";
