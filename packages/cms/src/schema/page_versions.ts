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
import type { Localized } from "../core/types/pages";
import type { PageVersionStatus } from "../core/types/versioning";
import type { BylineCredit } from "../core/types/bylines";

export const pageVersions: PgTableWithColumns<any> = pgTable(
  "page_versions",
  {
    id: uuid("id").defaultRandom().notNull().primaryKey(),
    pageId: uuid("page_id").notNull(),
    versionNumber: integer("version_number").notNull(),
    status: text("status").$type<PageVersionStatus>().default("pending").notNull(),
    slug: text("slug").notNull(),
    type: text("type").$type<string>().notNull(),
    title: jsonb("title").$type<Localized>().notNull(),
    description: jsonb("description").$type<Localized>(),
    tags: jsonb("tags").$type<Localized[]>().default([]).notNull(),
    authorIds: jsonb("author_ids").$type<string[]>().default([]),
    bylines: jsonb("bylines").$type<BylineCredit[]>().default([]),
    content: jsonb("content")
      .$type<{
        blocks: BaseBlock[];
        properties: Record<string, any>;
      }>()
      .notNull(),
    createdBy: text("created_by").notNull(),
    approvedBy: jsonb("approved_by").$type<string[]>().default([]).notNull(),
    approvedAt: timestamp("approved_at", { withTimezone: true }),
    changeSummary: text("change_summary"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("page_versions_page_id_version_idx").on(table.pageId, table.versionNumber),
  ],
);
