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
 * A player's balance of one currency in one title. The currency is keyed by its internal id (a UUIDv4), the
 * same id the game's currency table holds. One row per (user, title, currency), created on first grant. The
 * server is the only writer: a client reads its balances, and changes them only through the server's routes.
 */
export const titleCurrencies = pgTable(
  "title_currencies",
  {
    userId: uuid("user_id").notNull(),
    title: text("title").notNull(),
    currencyId: uuid("currency_id").notNull(),
    amount: integer("amount").default(0).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    // Names match the constraints in the database (see the migrations that created and altered the table).
    primaryKey({
      name: "title_currencies_user_id_title_currency_pk",
      columns: [t.userId, t.title, t.currencyId],
    }),
    foreignKey({
      name: "title_currencies_user_id_users_id_fk",
      columns: [t.userId],
      foreignColumns: [users.id],
    }).onDelete("cascade"),
  ],
);
