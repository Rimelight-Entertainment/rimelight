import { pgTable, text, timestamp, uuid, type PgTableWithColumns } from "drizzle-orm/pg-core";
import { pageVersions } from "./page_versions";

export const pageVersionComments: PgTableWithColumns<any> = pgTable("page_version_comments", {
  id: uuid("id").defaultRandom().notNull().primaryKey(),
  versionId: uuid("version_id")
    .notNull()
    .references(() => pageVersions.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull(),
  userRole: text("user_role").notNull(),
  content: text("content").notNull(),
  blockId: text("block_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
