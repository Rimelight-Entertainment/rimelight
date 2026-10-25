import {
  foreignKey,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  type PgTableWithColumns,
} from "drizzle-orm/pg-core";
import { pages } from "./pages";
import type { Localized } from "../core/types/pages";

export const taxonomyTerms: PgTableWithColumns<any> = pgTable(
  "taxonomy_terms",
  {
    id: uuid("id").defaultRandom().notNull().primaryKey(),
    taxonomy: text("taxonomy").notNull(), // "category" | "tag" | custom (e.g. "genre")
    slug: text("slug").notNull(),
    label: jsonb("label").$type<Localized | string>().notNull(),
    description: jsonb("description").$type<Localized | string>(),
    parentId: uuid("parent_id"),
    displayOrder: integer("display_order").default(0).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(() => new Date()),
  },
  (table) => [
    uniqueIndex("taxonomy_terms_tax_slug_idx").on(table.taxonomy, table.slug),
    foreignKey({
      columns: [table.parentId],
      foreignColumns: [table.id],
      name: "taxonomy_terms_parent_id_fk",
    }).onDelete("cascade"),
  ],
);

export const pageTaxonomyTerms: PgTableWithColumns<any> = pgTable(
  "page_taxonomy_terms",
  {
    pageId: uuid("page_id")
      .notNull()
      .references(() => pages.id, { onDelete: "cascade" }),
    termId: uuid("term_id")
      .notNull()
      .references(() => taxonomyTerms.id, { onDelete: "cascade" }),
    assignedAt: timestamp("assigned_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [uniqueIndex("page_taxonomy_terms_page_term_idx").on(table.pageId, table.termId)],
);
