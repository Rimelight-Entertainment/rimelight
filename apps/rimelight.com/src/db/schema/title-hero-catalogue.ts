import { pgTable, primaryKey, text, uuid } from "drizzle-orm/pg-core";

/**
 * The heroes a title allows into its experience grants. Keyed by the title slug and the hero's id from the game.
 * Only a migration writes it; the server reads it to refuse a grant for a hero the title does not have.
 */
export const titleHeroCatalogue = pgTable(
  "title_hero_catalogue",
  {
    title: text("title").notNull(),
    heroId: uuid("hero_id").notNull(),
  },
  (t) => [
    // Names match the constraint in the migration that creates the table.
    primaryKey({
      name: "title_hero_catalogue_title_hero_id_pk",
      columns: [t.title, t.heroId],
    }),
  ],
);
