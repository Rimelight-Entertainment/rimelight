import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

/**
 * A game server instance's credential for one title. The id is sent with the secret as `X-Game-Server: <id>.<secret>`. Only
 * sha256(secret) is stored, in hex. A credential is revoked by setting `revoked_at`, not by deleting the row, so a batch that
 * names it stays attributable.
 */
export const gameServerCredentials = pgTable("game_server_credentials", {
  id: uuid("id").defaultRandom().notNull().primaryKey(),
  title: text("title").notNull(),
  label: text("label").notNull(),
  secretHash: text("secret_hash").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  revokedAt: timestamp("revoked_at", { withTimezone: true }),
});
