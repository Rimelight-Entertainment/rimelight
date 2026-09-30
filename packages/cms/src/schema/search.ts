import { customType, index, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { pages } from "./pages.ts";

const tsvector = customType<{ data: string }>({
  dataType() {
    return "tsvector";
  },
});

export const contentSearchIndex = pgTable(
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
