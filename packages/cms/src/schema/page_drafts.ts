import { jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { pages } from "./pages.ts";
import type { BaseBlock } from "../core/types/blocks";

export const pageDrafts = pgTable("page_drafts", {
  pageId: uuid("page_id")
    .notNull()
    .primaryKey()
    .references(() => pages.id, { onDelete: "cascade" }),
  content: jsonb("content")
    .$type<{
      blocks: BaseBlock[];
      properties: Record<string, any>;
    }>()
    .notNull(),
  updatedBy: text("updated_by").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});
