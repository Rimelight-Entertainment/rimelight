import { pgTable, uuid, text, jsonb, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

export const bylines = pgTable(
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
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => [uniqueIndex("bylines_slug_idx").on(table.slug)],
);

export type Byline = typeof bylines.$inferSelect;
export type NewByline = typeof bylines.$inferInsert;
