import {
  boolean,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  type PgTableWithColumns,
} from "drizzle-orm/pg-core";

/** CMS accounts: one row per verified identity that has been provisioned (see auth/provision.ts). */
export const cmsUsers: PgTableWithColumns<any> = pgTable(
  "cms_users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").notNull(),
    name: text("name"),
    role: text("role").notNull(),
    subject: text("subject"),
    disabled: boolean("disabled").default(false).notNull(),
    /** Set when an admin edits the name; IdP sync then leaves it alone. */
    nameManaged: boolean("name_managed").default(false).notNull(),
    /** Set when an admin sets the role (including invites); IdP role sync then leaves it alone. */
    roleManaged: boolean("role_managed").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [uniqueIndex("cms_users_email_idx").on(table.email)],
);

export type CmsUser = typeof cmsUsers.$inferSelect;
