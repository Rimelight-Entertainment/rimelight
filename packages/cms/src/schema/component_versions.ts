import { pgTable, text, timestamp, uuid, uniqueIndex } from "drizzle-orm/pg-core"

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

export type ComponentVersion = typeof componentVersions.$inferSelect
export type NewComponentVersion = typeof componentVersions.$inferInsert
