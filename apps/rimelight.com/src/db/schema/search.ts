import { customType, pgTable, text, timestamp, uuid, unique, index } from "drizzle-orm/pg-core";

const tsvector = customType<{ data: string }>({
  dataType() {
    return "tsvector";
  }
});

export const searchIndex = pgTable(
  "search_index",
  {
    id: uuid("id").defaultRandom().notNull().primaryKey(),
    sourceType: text("source_type").notNull(),
    sourceId: text("source_id").notNull(),
    title: text("title").notNull(),
    url: text("url").notNull(),
    bodyContent: text("body_content").notNull(),
    searchableText: tsvector("searchable_text"),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
  },
  (t) => [
    unique("search_index_source_type_source_id_key").on(t.sourceType, t.sourceId),
    index("idx_search_index_text").using("gin", t.searchableText)
  ]
);
export type SearchIndex = typeof searchIndex.$inferSelect;
export type NewSearchIndex = typeof searchIndex.$inferInsert;
