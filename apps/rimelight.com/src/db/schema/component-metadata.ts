import { index, jsonb, pgTable, text, timestamp, uuid, uniqueIndex } from "drizzle-orm/pg-core"

export const componentMetadata = pgTable(
  "component_metadata",
  {
    id: uuid("id").defaultRandom().notNull().primaryKey(),
    componentName: text("component_name").notNull(),
    version: text("version").notNull(),
    framework: text("framework").notNull(),
    filePath: text("file_path").notNull(),
    props: jsonb("props").$type<Record<string, any>>().notNull(),
    slots: jsonb("slots").$type<Record<string, any>>().notNull(),
    emits: jsonb("emits").$type<Record<string, any>>().notNull(),
    theme: jsonb("theme").$type<Record<string, any>>(),
    extractedAt: timestamp("extracted_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(() => new Date())
  },
  (table) => [
    uniqueIndex("component_metadata_name_version_idx").on(table.componentName, table.version)
  ]
)

export const componentVersions = pgTable(
  "component_versions",
  {
    id: uuid("id").defaultRandom().notNull().primaryKey(),
    componentName: text("component_name").notNull(),
    version: text("version").notNull(),
    filePath: text("file_path").notNull(),
    gitCommit: text("git_commit"),
    extractedAt: timestamp("extracted_at", { withTimezone: true }).defaultNow().notNull()
  },
  (table) => [
    uniqueIndex("component_versions_name_version_idx").on(table.componentName, table.version)
  ]
)

export const componentMetadataCache = pgTable(
  "component_metadata_cache",
  {
    componentName: text("component_name").primaryKey(),
    metadata: jsonb("metadata").$type<Record<string, any>>().notNull(),
    cacheKey: text("cache_key").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull()
  },
  (table) => [index("component_metadata_cache_expires_idx").on(table.expiresAt)]
)

export const componentDependencies = pgTable(
  "component_dependencies",
  {
    id: uuid("id").defaultRandom().notNull().primaryKey(),
    sourceComponent: text("source_component").notNull(),
    targetComponent: text("target_component").notNull(),
    dependencyType: text("dependency_type").notNull()
  },
  (table) => [
    uniqueIndex("component_dependencies_unique_idx").on(
      table.sourceComponent,
      table.targetComponent,
      table.dependencyType
    )
  ]
)
