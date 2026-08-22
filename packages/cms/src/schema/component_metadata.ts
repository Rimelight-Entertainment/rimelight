import { pgTable, text, timestamp, uuid, uniqueIndex, jsonb } from "drizzle-orm/pg-core"

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

export type ComponentMetadata = typeof componentMetadata.$inferSelect
export type NewComponentMetadata = typeof componentMetadata.$inferInsert
