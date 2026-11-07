import { Hono } from "hono";
import { and, desc, eq } from "drizzle-orm";
import { getDb } from "#db";
import { titleLedgerBatches } from "#db/schema/title-ledger";
import { titleMail } from "#db/schema/title-mail";
import { z } from "zod";
import { t } from "@rimelight/i18n";
import { currencyCapsFor } from "../../title-currencies";
import { itemCapsFor } from "../../title-items";
import { netBatch } from "../../title-ledger";
import { LedgerRefusal, writeLedgerChanges } from "../../title-ledger-write";
import {
  decideMailSend,
  mailAttachmentsRefusal,
  mailSendLedgerEntries,
  mailSendRefusal,
  mailClaimRefusal,
  mailLedgerEntries,
  mailStacksAreDistinct,
  type MailAttachmentsRefusal,
  type MailClaimRefusal,
  type MailContent,
  type MailSendRefusal,
} from "../../title-mail";
import { isTitleSlug, type TitleSlug } from "../../titles";
import type { ClientVariables } from "./middleware";
import { requireGameServer, type GameServerVariables } from "./game-server-auth";
import { playerExists, serverPlayerSchema } from "./server-player";

/**
 * Mail on the web API: a letter a server sends one player, with items and currency attached. The game server sends and claims
 * letters; the player reads their own letters with the bearer token. A claim credits every attachment through the wallet's batch
 * rules in the same transaction that marks the letter claimed, so a letter is claimed once or not at all.
 */
const MAX_STACKS = 32;
const MAX_AMOUNT = 1_000_000_000;

const uuid = z
  .string()
  .uuid()
  .transform((value) => value.toLowerCase());
const sendSchema = z
  .object({
    id: uuid,
    recipient: uuid,
    sender: uuid.nullable().default(null),
    subject: z.string().trim().min(1).max(200),
    body: z.string().max(5000),
    items: z
      .array(z.object({ item: uuid, quantity: z.number().int().min(1).max(MAX_AMOUNT) }))
      .max(MAX_STACKS),
    currency: z
      .array(z.object({ currency: uuid, amount: z.number().int().min(1).max(MAX_AMOUNT) }))
      .max(MAX_STACKS),
  })
  // A letter may be text alone: a message with no attachments debits nothing from its sender.
  .refine((mail) => mailStacksAreDistinct(mail.items, mail.currency));
const claimSchema = z.object({ mail: uuid, player: serverPlayerSchema });

const CLAIM_REFUSAL_KEY = {
  unknown: "api.message.mail-unknown",
  "wrong-recipient": "api.message.mail-wrong-recipient",
  "already-claimed": "api.message.mail-already-claimed",
} as const satisfies Record<MailClaimRefusal, string>;

const SEND_REFUSAL_KEY = {
  "unknown-recipient": "api.message.mail-unknown-recipient",
  "unknown-sender": "api.message.mail-unknown-sender",
} as const satisfies Record<MailSendRefusal, string>;

/** A send or claim the mail refuses. Thrown inside a transaction, so nothing written before it survives. `reason` is a code the client can act on. */
class MailRefusal extends Error {
  readonly status: 404 | 409;
  readonly reason: MailAttachmentsRefusal | undefined;

  constructor(status: 404 | 409, message: string, reason?: MailAttachmentsRefusal) {
    super(message);
    this.status = status;
    this.reason = reason;
  }
}

function unixSeconds(date: Date): number {
  return Math.floor(date.getTime() / 1000);
}

/** A letter as the player and the game server read it: its text, its attachments, and when it was sent and claimed. */
function mailResponse(row: typeof titleMail.$inferSelect) {
  return {
    id: row.id,
    subject: row.subject,
    body: row.body,
    items: row.items,
    currency: row.currency,
    sentAt: unixSeconds(row.sentAt),
    claimedAt: row.claimedAt === null ? null : unixSeconds(row.claimedAt),
  };
}

export const mailRoutes = new Hono<{
  Bindings: Env;
  Variables: ClientVariables;
}>();

/** The game server's mail routes. Mounted at `/server/v1`, outside the client router; the player is named in the body. */
export const mailServerRoutes = new Hono<{
  Bindings: Env;
  Variables: GameServerVariables;
}>();

/** The signed-in player's letters in this title, newest first, with their attachments and whether each is claimed. */
mailRoutes.get("/titles/:title/mail", async (c) => {
  const title = c.req.param("title");
  if (!isTitleSlug(title)) {
    return c.json({ error: "Not Found", message: t("api.message.unknown-title") }, 404);
  }

  const rows = await getDb()
    .select()
    .from(titleMail)
    .where(and(eq(titleMail.recipientId, c.var.user.id), eq(titleMail.title, title)))
    .orderBy(desc(titleMail.sentAt));
  return c.json({ mail: rows.map(mailResponse) });
});

/**
 * The game server sends a letter to a player. A letter that names a sender is a player-to-player send: its attachments are debited
 * from the sender in the same transaction that writes the letter, as one ledger batch under the letter's id, reason `mail.send`.
 * A letter with no sender is granted by the server and debits no one. The id is the caller's, so a retry of the same letter
 * returns the stored row; the same id with a different letter is refused.
 */
mailServerRoutes.post("/titles/:title/mail/server/send", requireGameServer, async (c) => {
  const title = c.req.param("title");
  if (!isTitleSlug(title)) {
    return c.json({ error: "Not Found", message: t("api.message.unknown-title") }, 404);
  }

  let json: unknown;
  try {
    json = await c.req.json();
  } catch {
    return c.json({ error: "Bad Request", message: t("api.message.body-must-be-json") }, 400);
  }
  const parsed = sendSchema.safeParse(json);
  if (!parsed.success) {
    return c.json({ error: "Bad Request", message: t("api.message.mail-invalid") }, 400);
  }
  const mail = parsed.data;

  // Every attachment must name a currency or item the title has a cap for, so nothing can be claimed that the wallet does not know.
  const currencyCaps = currencyCapsFor(title as TitleSlug);
  const itemCaps = itemCapsFor(title as TitleSlug);
  const unknownAttachment =
    mail.items.some((stack) => itemCaps[stack.item] === undefined) ||
    mail.currency.some((stack) => currencyCaps[stack.currency] === undefined);
  if (unknownAttachment) {
    return c.json({ error: "Bad Request", message: t("api.message.ledger-unknown") }, 400);
  }

  const incoming: MailContent = {
    recipient: mail.recipient,
    sender: mail.sender,
    title,
    subject: mail.subject,
    body: mail.body,
    items: mail.items,
    currency: mail.currency,
  };

  // The caps of every attachment, for the sender's debit. Each id was checked against the title above.
  const caps: Record<string, number> = {};
  for (const stack of mail.items) caps[stack.item] = itemCaps[stack.item]!;
  for (const stack of mail.currency) caps[stack.currency] = currencyCaps[stack.currency]!;
  const debit = mail.sender === null ? null : netBatch(mailSendLedgerEntries(mail));
  if (mail.sender !== null && debit === null) {
    return c.json({ error: "Bad Request", message: t("api.message.mail-invalid") }, 400);
  }

  try {
    const letter = await getDb().transaction(async (tx) => {
      const refusal = mailSendRefusal({
        recipient: await playerExists(tx, mail.recipient),
        sender: mail.sender === null ? null : await playerExists(tx, mail.sender),
      });
      if (refusal) throw new MailRefusal(404, t(SEND_REFUSAL_KEY[refusal]));

      const written = await tx
        .insert(titleMail)
        .values({
          id: mail.id,
          recipientId: mail.recipient,
          senderId: mail.sender,
          title,
          subject: mail.subject,
          body: mail.body,
          items: mail.items,
          currency: mail.currency,
        })
        .onConflictDoNothing({ target: titleMail.id })
        .returning();
      if (written.length > 0) {
        if (mail.sender !== null && debit !== null && debit.size > 0) {
          const [batch] = await tx
            .insert(titleLedgerBatches)
            .values({
              userId: mail.sender,
              title,
              requestId: mail.id,
              gameServerId: c.var.gameServerId,
            })
            .onConflictDoNothing({
              target: [
                titleLedgerBatches.userId,
                titleLedgerBatches.title,
                titleLedgerBatches.requestId,
              ],
            })
            .returning({ id: titleLedgerBatches.id });
          if (!batch) throw new MailRefusal(409, t("api.message.mail-id-reused"));
          await writeLedgerChanges(tx, mail.sender, title, batch.id, debit, caps);
        }
        return written[0]!;
      }

      // The id was sent before: the same letter replays the stored row, and a different letter under the id is refused.
      const [stored] = await tx.select().from(titleMail).where(eq(titleMail.id, mail.id));
      const storedContent: MailContent = {
        recipient: stored!.recipientId,
        sender: stored!.senderId,
        title: stored!.title,
        subject: stored!.subject,
        body: stored!.body,
        items: stored!.items,
        currency: stored!.currency,
      };
      if (decideMailSend(storedContent, incoming) === "conflict") {
        throw new MailRefusal(409, t("api.message.mail-id-reused"));
      }
      return stored!;
    });
    return c.json({ success: true, mail: mailResponse(letter) });
  } catch (err) {
    if (err instanceof MailRefusal) {
      return c.json(
        { error: err.status === 404 ? "Not Found" : "Conflict", message: err.message },
        err.status,
      );
    }
    if (err instanceof LedgerRefusal)
      return c.json({ error: "Conflict", message: err.message }, 409);
    throw err;
  }
});

/**
 * The game server claims a letter for the player it names in the body. The letter is locked, checked, marked claimed, and its
 * attachments credited as one ledger batch, all in one transaction: a letter is claimed once or not at all.
 */
mailServerRoutes.post("/titles/:title/mail/server/claim", requireGameServer, async (c) => {
  const title = c.req.param("title");
  if (!isTitleSlug(title)) {
    return c.json({ error: "Not Found", message: t("api.message.unknown-title") }, 404);
  }

  let json: unknown;
  try {
    json = await c.req.json();
  } catch {
    return c.json({ error: "Bad Request", message: t("api.message.body-must-be-json") }, 400);
  }
  const parsed = claimSchema.safeParse(json);
  if (!parsed.success) {
    return c.json({ error: "Bad Request", message: t("api.message.mail-invalid") }, 400);
  }

  const claimant = parsed.data.player;
  const gameServerId = c.var.gameServerId;
  try {
    const claimed = await getDb().transaction(async (tx) => {
      const [mail] = await tx
        .select()
        .from(titleMail)
        .where(and(eq(titleMail.id, parsed.data.mail), eq(titleMail.title, title)))
        .for("update");
      const refusal = mailClaimRefusal(
        mail ? { recipient: mail.recipientId, claimed: mail.claimedAt !== null } : null,
        claimant,
      );
      if (refusal !== null) {
        throw new MailRefusal(refusal === "unknown" ? 404 : 409, t(CLAIM_REFUSAL_KEY[refusal]));
      }
      const letter = mail!;

      const attachmentsRefusal = mailAttachmentsRefusal(letter.items, letter.currency);
      if (attachmentsRefusal !== null) {
        throw new MailRefusal(409, t("api.message.mail-attachments-invalid"), attachmentsRefusal);
      }

      // Each attachment must name a currency or item the title has a cap for, as the wallet's batch rules require.
      const currencyCaps = currencyCapsFor(title as TitleSlug);
      const itemCaps = itemCapsFor(title as TitleSlug);
      const caps: Record<string, number> = {};
      for (const stack of letter.items) {
        const cap = itemCaps[stack.item];
        if (cap === undefined) throw new MailRefusal(409, t("api.message.ledger-unknown"));
        caps[stack.item] = cap;
      }
      for (const stack of letter.currency) {
        const cap = currencyCaps[stack.currency];
        if (cap === undefined) throw new MailRefusal(409, t("api.message.ledger-unknown"));
        caps[stack.currency] = cap;
      }

      const net = netBatch(
        mailLedgerEntries({
          id: letter.id,
          subject: letter.subject,
          items: letter.items,
          currency: letter.currency,
        }),
      );
      if (!net) throw new MailRefusal(409, t("api.message.ledger-invalid"));

      // Claim batches get a fresh requestId: the send batch for a self-sent letter
      // already uses (claimant, title, letter.id), so reusing it would collide.
      // Idempotency comes from the FOR UPDATE lock and the claimedAt check above.
      const [batch] = await tx
        .insert(titleLedgerBatches)
        .values({
          userId: claimant,
          title,
          requestId: `mail-claim:${crypto.randomUUID()}`,
          gameServerId,
        })
        .returning({ id: titleLedgerBatches.id });
      if (!batch) throw new MailRefusal(409, t("api.message.ledger-invalid"));
      const balances = await writeLedgerChanges(tx, claimant, title, batch.id, net, caps);

      const claimedAt = new Date();
      await tx.update(titleMail).set({ claimedAt }).where(eq(titleMail.id, letter.id));
      return { claimedAt, balances: Object.fromEntries(balances) };
    });
    return c.json({
      success: true,
      claimedAt: unixSeconds(claimed.claimedAt),
      balances: claimed.balances,
    });
  } catch (err) {
    if (err instanceof MailRefusal) {
      return c.json(
        {
          error: err.status === 404 ? "Not Found" : "Conflict",
          message: err.message,
          ...(err.reason !== undefined && { reason: err.reason }),
        },
        err.status,
      );
    }
    if (err instanceof LedgerRefusal) {
      return c.json({ error: "Conflict", message: err.message }, 409);
    }
    throw err;
  }
});
