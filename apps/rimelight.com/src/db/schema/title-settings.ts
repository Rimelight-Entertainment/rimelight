import {
  foreignKey,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
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
    userId: uuid("user_id").notNull(),
    title: text("title").notNull(),
    settings: jsonb("settings").$type<TitleSettingsDocument>().default({}).notNull(),
    version: integer("version").default(0).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    // Names match the constraints in the database (see the migration that created the table).
    primaryKey({ name: "title_settings_user_id_title_pk", columns: [t.userId, t.title] }),
    foreignKey({
      name: "title_settings_user_id_users_id_fk",
      columns: [t.userId],
      foreignColumns: [users.id],
    }).onDelete("cascade"),
  ],
);
