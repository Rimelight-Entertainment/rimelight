import { bigint, pgTable, primaryKey, text, timestamp, uuid } from "drizzle-orm/pg-core";

/**
 * A player's experience in one proficiency in one title. Keyed by the proficiency's internal id (a UUIDv4).
 * Experience is stored uncapped: the part past the cap is converted to Engram, but the total is kept. The
 * server is the only writer; a client reads its experience, and changes it only through the server's routes.
 */
export const titleProficiencies = pgTable(
  "title_proficiencies",
  {
    userId: uuid("user_id").notNull(),
    title: text("title").notNull(),
    proficiencyId: uuid("proficiency_id").notNull(),
    experience: bigint("experience", { mode: "number" }).default(0).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    // Names match the constraints in the migration that creates the table.
    primaryKey({
      name: "title_proficiencies_user_id_title_proficiency_pk",
      columns: [t.userId, t.title, t.proficiencyId],
    }),
  ],
);
