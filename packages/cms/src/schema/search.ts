import {
  customType,
  index,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
  type PgTableWithColumns,
} from "drizzle-orm/pg-core";
import { pages } from "./pages";

const tsvector = customType<{ data: string }>({
  dataType() {
    return "tsvector";
  },
});

export const contentSearchIndex: PgTableWithColumns<any> = pgTable(
  "content_search_index",
  {
    id: uuid("id").defaultRandom().notNull().primaryKey(),
    pageId: uuid("page_id")
      .notNull()
      .references(() => pages.id, { onDelete: "cascade" }),
    locale: text("locale").notNull(),
    titleText: text("title_text").notNull(),
    contentText: text("content_text").notNull(),
    searchVector: tsvector("search_vector"),
  },
  (table) => [index("search_vector_gin_idx").using("gin", table.searchVector)],
);

export const searchIndex: PgTableWithColumns<any> = pgTable(
  "search_index",
  {
    id: uuid("id").defaultRandom().notNull().primaryKey(),
    sourceType: text("source_type").notNull(),
    sourceId: text("source_id").notNull(),
    title: text("title").notNull(),
    url: text("url").notNull(),
    bodyContent: text("body_content").notNull(),
    searchableText: tsvector("searchable_text"),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    unique("search_index_source_type_source_id_key").on(t.sourceType, t.sourceId),
    index("idx_search_index_text").using("gin", t.searchableText),
  ],
);

export type SearchIndex = typeof searchIndex.$inferSelect;
export type NewSearchIndex = typeof searchIndex.$inferInsert;
