import { Hono } from "hono";
import { and, eq } from "drizzle-orm";
import { getDb } from "#db";
import { titleCurrencies } from "#db/schema/title-currencies";
import { titleLedgerBatches, titleLedgerEntries } from "#db/schema/title-ledger";
import { z } from "zod";
import { t } from "@rimelight/i18n";
import { clampBalance, currencyCapsFor } from "../../title-currencies";
import { itemCapsFor } from "../../title-items";
import { decideLedgerRequest, netBatch } from "../../title-ledger";
import { LedgerRefusal, writeLedgerChanges } from "../../title-ledger-write";
import { proficiencyIdsFor } from "../../title-proficiencies";
import { titleProficiencies } from "#db/schema/title-proficiencies";
import { titleHeroes } from "#db/schema/title-heroes";
import { canGrantHeroExperience, heroExperienceAdd } from "../../title-heroes";
import { isTitleSlug, type TitleSlug } from "../../titles";
import { requireGameServer, type GameServerVariables } from "./game-server-auth";
import { playerExists, serverPlayerSchema } from "./server-player";

/**
 * The wallet's batch route. The game server sends a whole batch of currency and item changes for one player; this route applies
 * all of them in one transaction, or none. The rules are planLedger's, the same as the game's wallet. The player is named in the body,
 * and the game server's credential is what lets the batch through. A batch is journaled under its request id, so a
 * retry of the same batch replays the stored balances instead of applying again.
 */
const MAX_ENTRIES = 32;

const entrySchema = z.object({
  kind: z.enum(["currency", "item"]),
  id: z.string().uuid(),
  delta: z.number().int().min(-1_000_000_000).max(1_000_000_000),
  reason: z.string().trim().min(1).max(500),
});
const applySchema = z.object({
  player: serverPlayerSchema,
  requestId: z.string().uuid(),
  entries: z.array(entrySchema).min(1).max(MAX_ENTRIES),
});

export const ledgerServerRoutes = new Hono<{
  Bindings: Env;
  Variables: GameServerVariables;
}>();

ledgerServerRoutes.post("/titles/:title/ledger/server/apply", requireGameServer, async (c) => {
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
  const { requestId, entries, player } = parsed.data;
  const userId = player;
  if (!(await playerExists(getDb(), userId))) {
    return c.json({ error: "Conflict", message: t("api.message.player-unknown") }, 409);
  }
  const gameServerId = c.var.gameServerId;

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

  // The journal keeps one row per id, so an id named as both a currency and an item cannot be recorded.
  const net = netBatch(entries);
  if (!net) {
    return c.json({ error: "Bad Request", message: t("api.message.ledger-invalid") }, 400);
  }

  const db = getDb();

  try {
    const balances = await db.transaction(async (tx) => {
      const inserted = await tx
        .insert(titleLedgerBatches)
        .values({ userId, title, requestId, gameServerId })
        .onConflictDoNothing({
          target: [
            titleLedgerBatches.userId,
            titleLedgerBatches.title,
            titleLedgerBatches.requestId,
          ],
        })
        .returning({ id: titleLedgerBatches.id });

      // The batch was already recorded: replay its stored balances, or refuse when the id names other changes.
      if (inserted.length === 0) {
        const [existing] = await tx
          .select({ id: titleLedgerBatches.id })
          .from(titleLedgerBatches)
          .where(
            and(
              eq(titleLedgerBatches.userId, userId),
              eq(titleLedgerBatches.title, title),
              eq(titleLedgerBatches.requestId, requestId),
            ),
          );
        const stored = await tx
          .select()
          .from(titleLedgerEntries)
          .where(eq(titleLedgerEntries.batchId, existing!.id));
        const storedEntries = stored.map((row) => ({
          kind: row.kind,
          id: row.itemId,
          delta: row.delta,
          reason: row.reason ?? "",
        }));
        if (decideLedgerRequest(storedEntries, entries) === "conflict") {
          throw new LedgerRefusal(t("api.message.ledger-request-reused"));
        }
        return Object.fromEntries(stored.map((row) => [row.itemId, row.balanceAfter]));
      }
      const batchId = inserted[0]!.id;

      return Object.fromEntries(await writeLedgerChanges(tx, userId, title, batchId, net, caps));
    });
    return c.json({ success: true, balances });
  } catch (err) {
    if (err instanceof LedgerRefusal)
      return c.json({ error: "Conflict", message: err.message }, 409);
    throw err;
  }
});

const grantExperienceSchema = z.object({
  player: serverPlayerSchema,
  requestId: z.string().uuid(),
  proficiency: z.string().uuid(),
  delta: z.number().int().min(-1_000_000_000).max(1_000_000_000),
  engramCurrency: z.string().uuid(),
  engram: z.number().int().min(0).max(1_000_000_000),
});

/**
 * The game server's grant of proficiency experience for one player, and the Engram that experience past the cap converts to.
 * The total is stored uncapped, never below zero. The grant is one batch under its request id: the experience and the Engram
 * credit are written in one transaction, and the Engram credit is journaled like any other currency change. A retry under the
 * same request id writes nothing and returns the stored state.
 */
ledgerServerRoutes.post(
  "/titles/:title/proficiencies/server/grant",
  requireGameServer,
  async (c) => {
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
    if (
      !parsed.success ||
      !proficiencyIdsFor(title as TitleSlug).includes(parsed.data.proficiency)
    ) {
      return c.json({ error: "Bad Request", message: t("api.message.proficiency-unknown") }, 400);
    }
    const userId = parsed.data.player;
    if (!(await playerExists(getDb(), userId))) {
      return c.json({ error: "Conflict", message: t("api.message.player-unknown") }, 409);
    }
    const gameServerId = c.var.gameServerId;
    const { requestId, proficiency, delta, engramCurrency, engram } = parsed.data;
    const engramCap = currencyCapsFor(title as TitleSlug)[engramCurrency];
    if (engramCap === undefined) {
      return c.json({ error: "Bad Request", message: t("api.message.ledger-unknown") }, 400);
    }

    const result = await getDb().transaction(async (tx) => {
      const inserted = await tx
        .insert(titleLedgerBatches)
        .values({ userId, title, requestId, gameServerId })
        .onConflictDoNothing({
          target: [
            titleLedgerBatches.userId,
            titleLedgerBatches.title,
            titleLedgerBatches.requestId,
          ],
        })
        .returning({ id: titleLedgerBatches.id });

      const key = and(
        eq(titleProficiencies.userId, userId),
        eq(titleProficiencies.title, title),
        eq(titleProficiencies.proficiencyId, proficiency),
      );
      const balanceKey = and(
        eq(titleCurrencies.userId, userId),
        eq(titleCurrencies.title, title),
        eq(titleCurrencies.currencyId, engramCurrency),
      );

      // The grant was already applied under this request id: report its stored state and write nothing.
      if (inserted.length === 0) {
        const [existing] = await tx
          .select({ id: titleLedgerBatches.id })
          .from(titleLedgerBatches)
          .where(
            and(
              eq(titleLedgerBatches.userId, userId),
              eq(titleLedgerBatches.title, title),
              eq(titleLedgerBatches.requestId, requestId),
            ),
          );
        const [experienceRow] = await tx.select().from(titleProficiencies).where(key);
        const engramRows =
          engram > 0
            ? await tx
                .select()
                .from(titleLedgerEntries)
                .where(
                  and(
                    eq(titleLedgerEntries.batchId, existing!.id),
                    eq(titleLedgerEntries.kind, "currency"),
                    eq(titleLedgerEntries.itemId, engramCurrency),
                  ),
                )
            : [];
        return {
          experience: experienceRow?.experience ?? 0,
          balance: engramRows[0]?.balanceAfter ?? null,
        };
      }
      const batchId = inserted[0]!.id;

      await tx
        .insert(titleProficiencies)
        .values({ userId, title, proficiencyId: proficiency })
        .onConflictDoNothing();
      const [row] = await tx.select().from(titleProficiencies).where(key).for("update");
      const experience = Math.max(0, row!.experience + delta);
      await tx.update(titleProficiencies).set({ experience, updatedAt: new Date() }).where(key);

      let balance: number | null = null;
      if (engram > 0) {
        await tx
          .insert(titleCurrencies)
          .values({ userId, title, currencyId: engramCurrency })
          .onConflictDoNothing();
        const [currency] = await tx.select().from(titleCurrencies).where(balanceKey).for("update");
        const before = currency!.amount;
        // The Engram clamps at the cap, so the journal records the amount actually credited, not the amount converted.
        balance = clampBalance(before + engram, engramCap);
        await tx.insert(titleLedgerEntries).values({
          batchId,
          kind: "currency",
          itemId: engramCurrency,
          delta: balance - before,
          balanceAfter: balance,
        });
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
  },
);

const heroExperienceGrantSchema = z.object({
  player: serverPlayerSchema,
  requestId: z.string().uuid(),
  // The game's hero ids fail zod's strict RFC 4122 uuid() check, so the id is not validated as a uuid here. canGrantHeroExperience
  // checks membership in HERO_IDS. The game sends uppercase; HERO_IDS is lowercase.
  heroId: z.string().transform((id) => id.toLowerCase()),
  amount: z.number().int().min(-1_000_000_000).max(1_000_000_000),
  pointTag: z.string().min(1),
});

/**
 * The game server's grant of experience with one hero, for the player it names in the body. Only a positive whole amount
 * up to the bound is accepted; the rule is canGrantHeroExperience's. The grant is one batch under its request id, written in the
 * same transaction as the experience total, so a retry under the same request id writes nothing and returns the stored total.
 * Like the proficiency grant, it journals no currency entry. The point tag names the hero's experience point and is kept on the batch's request.
 */
ledgerServerRoutes.post("/titles/:title/heroes/server/grant", requireGameServer, async (c) => {
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
  const parsed = heroExperienceGrantSchema.safeParse(body);
  if (!parsed.success || !canGrantHeroExperience(parsed.data.heroId, parsed.data.amount)) {
    return c.json({ error: "Bad Request", message: t("api.message.hero-experience-invalid") }, 400);
  }

  const userId = parsed.data.player;
  if (!(await playerExists(getDb(), userId))) {
    return c.json({ error: "Conflict", message: t("api.message.player-unknown") }, 409);
  }
  const gameServerId = c.var.gameServerId;
  const { requestId, heroId, amount, pointTag } = parsed.data;
  const key = and(
    eq(titleHeroes.userId, userId),
    eq(titleHeroes.title, title),
    eq(titleHeroes.heroId, heroId),
  );

  const experience = await getDb().transaction(async (tx) => {
    const inserted = await tx
      .insert(titleLedgerBatches)
      .values({ userId, title, requestId, gameServerId, request: { heroId, amount, pointTag } })
      .onConflictDoNothing({
        target: [titleLedgerBatches.userId, titleLedgerBatches.title, titleLedgerBatches.requestId],
      })
      .returning({ id: titleLedgerBatches.id });

    await tx.insert(titleHeroes).values({ userId, title, heroId }).onConflictDoNothing();
    const [row] = await tx.select().from(titleHeroes).where(key).for("update");

    // The grant was already applied under this request id: report the stored total and write nothing.
    if (inserted.length === 0) {
      return row!.experience;
    }
    const next = heroExperienceAdd(row!.experience, amount);
    await tx.update(titleHeroes).set({ experience: next, updatedAt: new Date() }).where(key);
    return next;
  });

  return c.json({ success: true, heroId, experience });
});
