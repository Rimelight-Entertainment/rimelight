import { sql } from "drizzle-orm";
import { integer, jsonb, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import type { BaseBlock } from "../core/types/blocks";
import type { Localized, PageType } from "../core/types/pages";
import type { BylineCredit } from "../core/types/bylines";
import { pageVersions } from "./page_versions.ts";
import { pageTemplates } from "./page_templates.ts";

export const pages = pgTable(
  "pages",
  {
    id: uuid("id").defaultRandom().notNull().primaryKey(),
    slug: text("slug").notNull(),
    type: text("type").$type<PageType>().notNull(),
    templateId: uuid("template_id").references(() => pageTemplates.id, { onDelete: "set null" }),
    templateVersion: integer("template_version").default(1).notNull(),
    title: jsonb("title").$type<Localized>().notNull(),
    description: jsonb("description").$type<Localized>(),
    tags: jsonb("tags").$type<Localized[]>().default([]).notNull(),
    authorIds: jsonb("author_ids").$type<string[]>().default([]),
    bylines: jsonb("bylines").$type<BylineCredit[]>().default([]),
    /**
     * Denormalized read-cache of the active published version content (NULL if unpublished draft)
     */
    content: jsonb("content")
      .$type<{
        blocks: BaseBlock[];
        properties: Record<string, any>;
      }>()
      .notNull(),
    publishedVersionId: uuid("published_version_id").references(() => pageVersions.id, {
      onDelete: "set null"
    }),
    postedAt: timestamp("posted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(() => new Date()),
    deletedAt: timestamp("deleted_at", { withTimezone: true })
  },
  (table) => [
    uniqueIndex("pages_slug_active_unique_idx")
      .on(table.slug)
      .where(sql`deleted_at IS NULL`)
  ]
);
