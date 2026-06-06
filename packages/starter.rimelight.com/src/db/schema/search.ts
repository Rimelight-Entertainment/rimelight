import { sqliteTable, text, integer, uniqueIndex } from "drizzle-orm/sqlite-core"

export const searchIndex = sqliteTable(
  "search_index",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    sourceType: text("source_type").notNull(),
    sourceId: text("source_id").notNull(),
    title: text("title").notNull(),
    url: text("url").notNull(),
    bodyContent: text("body_content").notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .$defaultFn(() => new Date())
      .notNull()
  },
  (t) => [uniqueIndex("search_index_source_type_source_id_key").on(t.sourceType, t.sourceId)]
)

// Declare the FTS5 virtual table for querying through Drizzle
export const searchIndexFts = sqliteTable("search_index_fts", {
  // SQLite virtual tables use 'rowid' as their primary identifier.
  // We map it to search_index.id.
  rowid: integer("rowid").primaryKey(),
  title: text("title").notNull(),
  bodyContent: text("body_content").notNull()
})

export type SearchIndex = typeof searchIndex.$inferSelect
export type NewSearchIndex = typeof searchIndex.$inferInsert
export type SearchIndexFts = typeof searchIndexFts.$inferSelect
export type NewSearchIndexFts = typeof searchIndexFts.$inferInsert
