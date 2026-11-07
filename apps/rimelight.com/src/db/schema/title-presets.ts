import { sql } from "drizzle-orm";
import {
  check,
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
import type { TitleSettingsDocument } from "./title-settings.ts";

/**
 * One of a player's five settings presets (slots 1..5) for one title. A preset is a name plus a full
 * settings snapshot, which the client applies itself; the server only stores and validates it. A row
 * is created on the first write to its slot and removed when the slot is cleared. The server is the
 * only writer.
 */
export const titlePresets = pgTable(
  "title_presets",
  {
    userId: uuid("user_id").notNull(),
    title: text("title").notNull(),
    slot: integer("slot").notNull(),
    name: text("name").notNull(),
    settings: jsonb("settings").$type<TitleSettingsDocument>().default({}).notNull(),
    version: integer("version").default(0).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    // Names match the constraints in the migration that creates the table.
    primaryKey({
      name: "title_presets_user_id_title_slot_pk",
      columns: [t.userId, t.title, t.slot],
    }),
    foreignKey({
      name: "title_presets_user_id_users_id_fk",
      columns: [t.userId],
      foreignColumns: [users.id],
    }).onDelete("cascade"),
    check("title_presets_slot_check", sql`${t.slot} >= 1 AND ${t.slot} <= 5`),
  ],
);

export type TitlePresetRow = typeof titlePresets.$inferSelect;
