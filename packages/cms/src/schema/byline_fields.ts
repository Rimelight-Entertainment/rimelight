import {
  pgTable,
  uuid,
  text,
  boolean,
  integer,
  jsonb,
  timestamp,
  uniqueIndex,
  type PgTableWithColumns,
} from "drizzle-orm/pg-core";
import type { BylineFieldType } from "../core/types/bylines";

export const bylineFields: PgTableWithColumns<any> = pgTable(
  "byline_fields",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull(),
    label: text("label").notNull(),
    type: text("type").$type<BylineFieldType>().notNull(),
    required: boolean("required").default(false).notNull(),
    translatable: boolean("translatable").default(false).notNull(),
    options: jsonb("options").$type<string[]>().default([]).notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [uniqueIndex("byline_fields_slug_idx").on(table.slug)],
);

export type BylineField = typeof bylineFields.$inferSelect;
export type NewBylineField = typeof bylineFields.$inferInsert;
