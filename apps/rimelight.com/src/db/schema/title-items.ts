import {
  foreignKey,
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { users } from "./users.ts";

/**
 * A player's amount of one item in one title. The item is keyed by its internal id (a UUIDv4, the same
 * id the game's catalogue holds), not by its gameplay tag. One row per (user, title, item), created on
 * first grant. Items never leave the inventory, so an amount of zero is a real row, not an absence. The
 * server is the only writer.
 */
export const titleItems = pgTable(
  "title_items",
  {
    userId: uuid("user_id").notNull(),
    title: text("title").notNull(),
    itemId: uuid("item_id").notNull(),
    amount: integer("amount").default(0).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    // Names match the migration that creates the table (20261030130000_title_items).
    primaryKey({
      name: "title_items_user_id_title_item_pk",
      columns: [t.userId, t.title, t.itemId],
    }),
    foreignKey({
      name: "title_items_user_id_users_id_fk",
      columns: [t.userId],
      foreignColumns: [users.id],
    }).onDelete("cascade"),
  ],
);
