import { bigint, integer, pgTable, primaryKey, text, timestamp, uuid } from "drizzle-orm/pg-core";

/**
 * A player's level in one facility of the Grand Estate, in one title. Keyed by the facility's internal id (a UUIDv4). A
 * facility the player has never levelled has no row, and reads as tier 1. The server is the only writer.
 */
export const titleEstateFacilities = pgTable(
  "title_estate_facilities",
  {
    userId: uuid("user_id").notNull(),
    title: text("title").notNull(),
    facilityId: uuid("facility_id").notNull(),
    tier: integer("tier").default(1).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    // Names match the constraints in the migration that creates the table.
    primaryKey({
      name: "title_estate_facilities_user_id_title_facility_pk",
      columns: [t.userId, t.title, t.facilityId],
    }),
  ],
);

/**
 * One expedition the player has sent and not yet claimed, in one title. A player has at most one row per expedition. The row
 * is removed when the expedition is recalled or its rewards are claimed. `reward` is set when the expedition concludes, so the
 * reward is generated on conclusion. Times are stored in UTC.
 */
export const titleEstateExpeditions = pgTable(
  "title_estate_expeditions",
  {
    userId: uuid("user_id").notNull(),
    title: text("title").notNull(),
    expeditionId: uuid("expedition_id").notNull(),
    tier: integer("tier").notNull(),
    startedAt: timestamp("started_at", { withTimezone: true }).notNull(),
    endsAt: timestamp("ends_at", { withTimezone: true }).notNull(),
    reward: bigint("reward", { mode: "number" }),
  },
  (t) => [
    primaryKey({
      name: "title_estate_expeditions_user_id_title_expedition_pk",
      columns: [t.userId, t.title, t.expeditionId],
    }),
  ],
);
