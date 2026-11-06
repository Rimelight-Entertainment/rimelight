import { bigint, pgTable, primaryKey, text, timestamp, uuid } from "drizzle-orm/pg-core";

/**
 * A player's experience with one hero in one title. Keyed by the hero's internal id (a UUIDv4).
 * The server is the only writer; a client reads its experience, and changes it only through the server's routes.
 */
export const titleHeroes = pgTable(
  "title_heroes",
  {
    userId: uuid("user_id").notNull(),
    title: text("title").notNull(),
    heroId: uuid("hero_id").notNull(),
    experience: bigint("experience", { mode: "number" }).default(0).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    // Names match the constraints in the migration that creates the table.
    primaryKey({
      name: "title_heroes_user_id_title_hero_id_pk",
      columns: [t.userId, t.title, t.heroId],
    }),
  ],
);
