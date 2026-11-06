import { foreignKey, index, jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { users } from "./users.ts";

/**
 * A letter sent to one player in one title, with items and currency attached. The game server sends it while the player is
 * offline, and the player claims it once, by command. The id is the sender's, so a retry of the same send names the same row.
 * `senderId` is the player whose attachments the send paid for; a letter the server grants has no sender. `items` and `currency`
 * hold the attachments as they were sent. `claimedAt` is set in the same transaction as the ledger batch that credits them, so a
 * mail is claimed exactly once. The server is the only writer.
 */
export const titleMail = pgTable(
  "title_mail",
  {
    id: uuid("id").notNull().primaryKey(),
    recipientId: uuid("recipient_id").notNull(),
    senderId: uuid("sender_id"),
    title: text("title").notNull(),
    subject: text("subject").notNull(),
    body: text("body").notNull(),
    items: jsonb("items").$type<{ item: string; quantity: number }[]>().notNull(),
    currency: jsonb("currency").$type<{ currency: string; amount: number }[]>().notNull(),
    sentAt: timestamp("sent_at", { withTimezone: true }).defaultNow().notNull(),
    claimedAt: timestamp("claimed_at", { withTimezone: true }),
  },
  (t) => [
    foreignKey({
      name: "title_mail_recipient_id_users_id_fk",
      columns: [t.recipientId],
      foreignColumns: [users.id],
    }).onDelete("cascade"),
    foreignKey({
      name: "title_mail_sender_id_users_id_fk",
      columns: [t.senderId],
      foreignColumns: [users.id],
    }).onDelete("set null"),
    index("title_mail_recipient_id_title_sent_at_idx").on(t.recipientId, t.title, t.sentAt),
  ],
);
