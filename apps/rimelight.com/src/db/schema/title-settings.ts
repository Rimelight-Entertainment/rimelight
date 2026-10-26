import { integer, jsonb, pgTable, primaryKey, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { users } from "./users.ts";

export type TitleSettingValue = string | number | boolean | null;
export type TitleSettingsDocument = Record<string, Record<string, TitleSettingValue>>;

/**
 * Settings one player keeps for one title (for example "grand-tale"). One row per (user, title),
 * created on first write. The title slug is checked against the registry in `api/titles.ts`.
 */
export const titleSettings = pgTable(
  "title_settings",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    settings: jsonb("settings").$type<TitleSettingsDocument>().default({}).notNull(),
    version: integer("version").default(0).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.title] })],
);
