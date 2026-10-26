import {
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
  type PgTableWithColumns,
} from "drizzle-orm/pg-core";
import type { Localized } from "../core/types/pages";
import type { BaseBlock } from "../core/types/blocks";
import type { CollectionKind, FieldDefinition, FieldGroup } from "../core/collections/types";

/** One row per collection. Collections are created in the CMS, so this is the only source. */
export const contentTypes: PgTableWithColumns<any> = pgTable("content_types", {
  id: uuid("id").defaultRandom().notNull().primaryKey(),
  slug: text("slug").notNull().unique(),
  name: jsonb("name").$type<Localized>().notNull(),
  description: jsonb("description").$type<Localized>(),
  icon: text("icon").default("i-lucide-box").notNull(),
  /** Entity colour (mention chips etc.). Null = derived from the slug. */
  color: text("color"),
  mode: text("mode").$type<CollectionKind>().default("document").notNull(),

  fieldSchema: jsonb("field_schema")
    .$type<{ groups: Record<string, FieldGroup>; fields: Record<string, FieldDefinition> }>()
    .default({ groups: {}, fields: {} })
    .notNull(),

  initialBlocks: jsonb("initial_blocks").$type<BaseBlock[]>().default([]).notNull(),
  features: jsonb("features").$type<Record<string, any>>().default({}).notNull(),
  workflow: jsonb("workflow").$type<Record<string, any>>().default({}).notNull(),

  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(() => new Date()),
});
