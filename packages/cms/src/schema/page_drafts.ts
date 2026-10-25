import {
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
  type PgTableWithColumns,
} from "drizzle-orm/pg-core";
import { pages } from "./pages";
import type { BaseBlock } from "../core/types/blocks";

export const pageDrafts: PgTableWithColumns<any> = pgTable("page_drafts", {
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
