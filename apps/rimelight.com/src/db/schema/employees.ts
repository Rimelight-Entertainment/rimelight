import { relations } from "drizzle-orm";
import { boolean, jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

/**
 * Enterprise Employees table. Managed via Enterprise IdP (Auth0) with corporate roles, departments,
 * and granular permissions.
 */
export const employees = pgTable("employees", {
  id: uuid("id").defaultRandom().notNull().primaryKey(),
  auth0Id: text("auth0_id").unique().notNull(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  avatar: text("avatar"),
  role: text("role").default("employee").notNull(),
  department: text("department"),
  title: text("title"),
  status: text("status").default("active").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  permissions: jsonb("permissions").$type<string[]>().default([]).notNull(),
  metadata: jsonb("metadata").$type<Record<string, any>>().default({}).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(() => new Date()),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp("deleted_at", { withTimezone: true })
});

export type Employee = typeof employees.$inferSelect;
export type NewEmployee = typeof employees.$inferInsert;

export const employeesRelations = relations(employees, () => ({}));
