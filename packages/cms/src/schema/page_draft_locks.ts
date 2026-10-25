import { pgTable, text, timestamp, uuid, type PgTableWithColumns } from "drizzle-orm/pg-core";
import { pages } from "./pages";

export const pageDraftLocks: PgTableWithColumns<any> = pgTable("page_draft_locks", {
  pageId: uuid("page_id")
    .notNull()
    .primaryKey()
    .references(() => pages.id, { onDelete: "cascade" }),
  lockedByUserId: text("locked_by_user_id").notNull(),
  lockedByUserName: text("locked_by_user_name").notNull(),
  acquiredAt: timestamp("acquired_at", { withTimezone: true }).defaultNow().notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
});
