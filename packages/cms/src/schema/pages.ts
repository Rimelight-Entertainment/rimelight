import { sql } from "drizzle-orm";
import {
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  type PgTableWithColumns,
} from "drizzle-orm/pg-core";
import type { BaseBlock } from "../core/types/blocks";
import type { EntryStatus, Localized, PageType } from "../core/types/pages";
import type { BylineCredit } from "../core/types/bylines";
import { pageVersions } from "./page_versions";
import { pageTemplates } from "./page_templates";

export const pages: PgTableWithColumns<any> = pgTable(
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
    /** Lifecycle status. Existing rows default to "published" so legacy content stays live. */
    status: text("status").$type<EntryStatus>().default("published").notNull(),
    /** When set and status is "scheduled", the cron publishes the draft at this time. */
    scheduledAt: timestamp("scheduled_at", { withTimezone: true }),
    publishedVersionId: uuid("published_version_id").references(() => pageVersions.id, {
      onDelete: "set null",
    }),
    postedAt: timestamp("posted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(() => new Date()),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [
    uniqueIndex("pages_slug_active_unique_idx")
      .on(table.slug)
      .where(sql`deleted_at IS NULL`),
  ],
);
