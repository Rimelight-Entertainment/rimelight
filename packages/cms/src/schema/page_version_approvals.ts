import { pgTable, text, timestamp, uuid, type PgTableWithColumns } from "drizzle-orm/pg-core";
import { pageVersions } from "./page_versions";

export const pageVersionApprovals: PgTableWithColumns<any> = pgTable("page_version_approvals", {
  id: uuid("id").defaultRandom().notNull().primaryKey(),
  versionId: uuid("version_id")
    .notNull()
    .references(() => pageVersions.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull(),
  userRole: text("user_role").notNull(),
  approvedAt: timestamp("approved_at", { withTimezone: true }).defaultNow().notNull(),
});
