import { pgTable, text, timestamp, jsonb, index } from "drizzle-orm/pg-core"

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

export type ComponentMetadataCache = typeof componentMetadataCache.$inferSelect
export type NewComponentMetadataCache = typeof componentMetadataCache.$inferInsert
