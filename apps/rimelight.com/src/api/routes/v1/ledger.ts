import { Hono } from "hono";
import { and, eq } from "drizzle-orm";
import { getDb } from "#db";
import { titleCurrencies } from "#db/schema/title-currencies";
import { titleItems } from "#db/schema/title-items";
import { z } from "zod";
import { t } from "@rimelight/i18n";
import { currencyCapsFor } from "../../title-currencies";
import { itemCapsFor } from "../../title-items";
import { planLedger, type LedgerEntry } from "../../title-ledger";
import { proficiencyIdsFor } from "../../title-proficiencies";
import { titleProficiencies } from "#db/schema/title-proficiencies";
import { clampBalance } from "../../title-currencies";
import { isTitleSlug, type TitleSlug } from "../../titles";
import { requireGameServer } from "./estate-server-auth";
import type { ClientVariables } from "./middleware";

/**
 * The wallet's batch route. The game server sends a whole batch of currency and item changes; this route applies all of them in
 * one transaction, or none. The rules are planLedger's, the same as the game's wallet. Only the game server may call it.
 */
const MAX_ENTRIES = 32;

const entrySchema = z.object({
  kind: z.enum(["currency", "item"]),
  id: z.string().uuid(),
  delta: z.number().int().min(-1_000_000_000).max(1_000_000_000),
});
const applySchema = z.object({
  userId: z.string().uuid(),
  entries: z.array(entrySchema).min(1).max(MAX_ENTRIES),
});

export const ledgerRoutes = new Hono<{ Bindings: Env; Variables: ClientVariables }>();

ledgerRoutes.post("/titles/:title/ledger/server/apply", requireGameServer, async (c) => {
  const title = c.req.param("title");
  if (!isTitleSlug(title)) {
    return c.json({ error: "Not Found", message: t("api.message.unknown-title") }, 404);
  }

  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "Bad Request", message: t("api.message.body-must-be-json") }, 400);
  }
  const parsed = applySchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: "Bad Request", message: t("api.message.ledger-invalid") }, 400);
  }
  const { userId, entries } = parsed.data;

  // Each entry must name a currency or item the title has a cap for, so nothing is written for an unknown id.
  const currencyCaps = currencyCapsFor(title as TitleSlug);
  const itemCaps = itemCapsFor(title as TitleSlug);
  const caps: Record<string, number> = {};
  for (const entry of entries) {
    const cap = entry.kind === "currency" ? currencyCaps[entry.id] : itemCaps[entry.id];
    if (cap === undefined) {
      return c.json({ error: "Bad Request", message: t("api.message.ledger-unknown") }, 400);
    }
    caps[entry.id] = cap;
  }

  const ledgerEntries: LedgerEntry[] = entries.map((entry) => ({
    id: entry.id,
    delta: entry.delta,
  }));
  const db = getDb();

  const result = await db.transaction(async (tx) => {
    // Lock every row the batch touches, creating any that do not exist yet, so the amounts read are the amounts written.
    const current = new Map<string, number>();
    const kinds = new Map<string, "currency" | "item">();
    for (const entry of entries) kinds.set(entry.id, entry.kind);
    for (const [id, kind] of kinds) {
      if (kind === "currency") {
        await tx
          .insert(titleCurrencies)
          .values({ userId, title, currencyId: id })
          .onConflictDoNothing();
        const [row] = await tx
          .select()
          .from(titleCurrencies)
          .where(
            and(
              eq(titleCurrencies.userId, userId),
              eq(titleCurrencies.title, title),
              eq(titleCurrencies.currencyId, id),
            ),
          )
          .for("update");
        current.set(id, row!.amount);
      } else {
        await tx.insert(titleItems).values({ userId, title, itemId: id }).onConflictDoNothing();
        const [row] = await tx
          .select()
          .from(titleItems)
          .where(
            and(
              eq(titleItems.userId, userId),
              eq(titleItems.title, title),
              eq(titleItems.itemId, id),
            ),
          )
          .for("update");
        current.set(id, row!.amount);
      }
    }

    const plan = planLedger(current, ledgerEntries, caps);
    if (!plan.ok) {
      return { ok: false as const, reason: plan.reason };
    }

    for (const [id, amount] of plan.next) {
      if (kinds.get(id) === "currency") {
        await tx
          .update(titleCurrencies)
          .set({ amount, updatedAt: new Date() })
          .where(
            and(
              eq(titleCurrencies.userId, userId),
              eq(titleCurrencies.title, title),
              eq(titleCurrencies.currencyId, id),
            ),
          );
      } else {
        await tx
          .update(titleItems)
          .set({ amount, updatedAt: new Date() })
          .where(
            and(
              eq(titleItems.userId, userId),
              eq(titleItems.title, title),
              eq(titleItems.itemId, id),
            ),
          );
      }
    }
    return { ok: true as const, balances: Object.fromEntries(plan.next) };
  });

  if (!result.ok) {
    return c.json(
      {
        error: "Conflict",
        message:
          result.reason === "over-cap"
            ? t("api.message.ledger-over-cap")
            : t("api.message.ledger-short"),
      },
      409,
    );
  }
  return c.json({ success: true, balances: result.balances });
});

const grantExperienceSchema = z.object({
  userId: z.string().uuid(),
  proficiency: z.string().uuid(),
  delta: z.number().int().min(-1_000_000_000).max(1_000_000_000),
  engramCurrency: z.string().uuid(),
  engram: z.number().int().min(0).max(1_000_000_000),
});

/**
 * The game server's grant of proficiency experience for one player, and the Engram that experience past the cap converts to.
 * The total is stored uncapped, never below zero. Both writes happen in one transaction.
 */
ledgerRoutes.post("/titles/:title/proficiencies/server/grant", requireGameServer, async (c) => {
  const title = c.req.param("title");
  if (!isTitleSlug(title)) {
    return c.json({ error: "Not Found", message: t("api.message.unknown-title") }, 404);
  }

  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "Bad Request", message: t("api.message.body-must-be-json") }, 400);
  }
  const parsed = grantExperienceSchema.safeParse(body);
  if (!parsed.success || !proficiencyIdsFor(title as TitleSlug).includes(parsed.data.proficiency)) {
    return c.json({ error: "Bad Request", message: t("api.message.proficiency-unknown") }, 400);
  }
  const { userId, proficiency, delta, engramCurrency, engram } = parsed.data;
  const engramCap = currencyCapsFor(title as TitleSlug)[engramCurrency];
  if (engramCap === undefined) {
    return c.json({ error: "Bad Request", message: t("api.message.ledger-unknown") }, 400);
  }

  const result = await getDb().transaction(async (tx) => {
    const key = and(
      eq(titleProficiencies.userId, userId),
      eq(titleProficiencies.title, title),
      eq(titleProficiencies.proficiencyId, proficiency),
    );
    await tx
      .insert(titleProficiencies)
      .values({ userId, title, proficiencyId: proficiency })
      .onConflictDoNothing();
    const [row] = await tx.select().from(titleProficiencies).where(key).for("update");
    const experience = Math.max(0, row!.experience + delta);
    await tx.update(titleProficiencies).set({ experience, updatedAt: new Date() }).where(key);

    let balance: number | null = null;
    if (engram > 0) {
      const balanceKey = and(
        eq(titleCurrencies.userId, userId),
        eq(titleCurrencies.title, title),
        eq(titleCurrencies.currencyId, engramCurrency),
      );
      await tx
        .insert(titleCurrencies)
        .values({ userId, title, currencyId: engramCurrency })
        .onConflictDoNothing();
      const [currency] = await tx.select().from(titleCurrencies).where(balanceKey).for("update");
      balance = clampBalance(currency!.amount + engram, engramCap);
      await tx
        .update(titleCurrencies)
        .set({ amount: balance, updatedAt: new Date() })
        .where(balanceKey);
    }
    return { experience, balance };
  });

  return c.json({
    success: true,
    proficiency,
    experience: result.experience,
    balances: result.balance === null ? {} : { [engramCurrency]: result.balance },
  });
});
