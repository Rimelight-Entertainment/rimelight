import {
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
  type PgTableWithColumns,
} from "drizzle-orm/pg-core";
import type { BaseBlock } from "../core/types/blocks";
import type { Localized } from "../core/types/pages";
import type { TemplateApprovalRules, TemplateRolePermissions } from "../core/types/templates";

export const pageTemplates: PgTableWithColumns<any> = pgTable("page_templates", {
  id: uuid("id").defaultRandom().notNull().primaryKey(),
  slug: text("slug").notNull().unique(),
  title: jsonb("title").$type<Localized>().notNull(),
  description: jsonb("description").$type<Localized>(),
  pageType: text("page_type").$type<string>().notNull(),
  version: integer("version").default(1).notNull(),
  allowedRoles: jsonb("allowed_roles").$type<string[]>().default([]).notNull(),
  rolePermissions: jsonb("role_permissions")
    .$type<TemplateRolePermissions>()
    .default({ whoCanCreate: [], whoCanEdit: [], whoCanReview: [], whoCanView: [] })
    .notNull(),
  requiredPermission: text("required_permission"),
  approvalRules: jsonb("approval_rules")
    .$type<TemplateApprovalRules>()
    .default({ allowSelfApproval: true, minApprovals: 1 })
    .notNull(),
  defaultProperties: jsonb("default_properties").default({}).notNull(),
  initialBlocks: jsonb("initial_blocks").$type<BaseBlock[]>().default([]).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(() => new Date()),
});
