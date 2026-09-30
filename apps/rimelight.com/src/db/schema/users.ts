import { boolean, jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export type AppUserAvailability = "available" | "busy" | "away" | "offline" | (string & {});

/**
 * Public & Consumer Platform Users table. Decoupled from enterprise staff and internal employee
 * tables.
 */
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().notNull().primaryKey(),
  auth0Id: text("auth0_id").unique(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  tag: text("tag").default("0000").notNull(),
  avatar: text("avatar"),
  emailVerified: boolean("email_verified").default(false).notNull(),
  availability: text("availability").$type<AppUserAvailability>().default("available").notNull(),
  status: text("status"),
  role: text("role").default("user").notNull(),
  banned: boolean("banned").default(false).notNull(),
  banReason: text("ban_reason"),
  banExpires: timestamp("ban_expires", { withTimezone: true }),
  metadata: jsonb("metadata").$type<Record<string, any>>().default({}).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(() => new Date()),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp("deleted_at", { withTimezone: true })
});

export type AppUser = typeof users.$inferSelect;
export type NewAppUser = typeof users.$inferInsert;
