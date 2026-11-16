import { boolean, date, jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

/**
 * Shared employees table: the website and Rimelight Space both use it (one table, one set of names).
 * Space's people and org columns are below. Its migrations live in the Space repo at
 * backend/db/migrations; keep these definitions in step with them.
 * auth0Id is nullable so Space can create people before their first sign-in.
 */
export const employees = pgTable("employees", {
  id: uuid("id").defaultRandom().notNull().primaryKey(),
  auth0Id: text("auth0_id").unique(),
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
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  // Rimelight Space people and org columns (backend/db/migrations 0003, 0005, 0008).
  preferredName: text("preferred_name"),
  pronouns: text("pronouns"),
  departmentId: uuid("department_id"),
  teamId: uuid("team_id"),
  managerId: uuid("manager_id"),
  positionId: uuid("position_id"),
  location: text("location"),
  timezone: text("timezone"),
  workPhone: text("work_phone"),
  bio: text("bio"),
  skills: text("skills").array().default([]).notNull(),
  startDate: date("start_date"),
  avatarKey: text("avatar_key"),
  isAdmin: boolean("is_admin").default(false).notNull(),
  personalPhone: text("personal_phone"),
  personalEmail: text("personal_email"),
  address: text("address"),
  birthday: date("birthday"),
  emergencyContact: text("emergency_contact"),
});

export type Employee = typeof employees.$inferSelect;
export type NewEmployee = typeof employees.$inferInsert;
