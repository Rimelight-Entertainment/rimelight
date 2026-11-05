import {
  pgTable,
  boolean,
  uuid,
  text,
  jsonb,
  timestamp,
  uniqueIndex,
  type PgTableWithColumns,
} from "drizzle-orm/pg-core";
import type { BylineFieldStored } from "../core/types/bylines";

export const bylines: PgTableWithColumns<any> = pgTable(
  "bylines",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    websiteUrl: text("website_url"),
    bio: text("bio"),
    avatar: text("avatar"),
    userId: text("user_id"),
    socials: jsonb("socials").$type<Record<string, string>>().default({}),
    metadata: jsonb("metadata").$type<Record<string, any>>().default({}),
    isGuest: boolean("is_guest").default(false).notNull(),
    fields: jsonb("fields").$type<Record<string, BylineFieldStored>>().default({}).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => [uniqueIndex("bylines_slug_idx").on(table.slug)],
);

export type Byline = typeof bylines.$inferSelect;
export type NewByline = typeof bylines.$inferInsert;
