import { Hono } from "hono";
import { and, eq, sql } from "drizzle-orm";
import { getDb } from "#db";
import { titleSettings } from "#db/schema/title-settings";
import { titleCurrencies } from "#db/schema/title-currencies";
import { titleItems } from "#db/schema/title-items";
import { z } from "zod";
import { canAdjustCurrency, clampBalance, currencyCapsFor } from "../../title-currencies";
import { itemCapsFor } from "../../title-items";
import { proficiencyIdsFor } from "../../title-proficiencies";
import { titleProficiencies } from "#db/schema/title-proficiencies";
import { titleEstateExpeditions, titleEstateFacilities } from "#db/schema/title-estate";
import {
  ESTATE_MAX_TIER,
  ESTATE_MIN_TIER,
  GOLD_CURRENCY_ID,
  canUseEstateDebug,
  concludesAt,
  estateCatalogFor,
  hasConcluded,
  isEstateTier,
  valueForTier,
} from "../../title-estate";
import { isTitleSlug, type TitleSlug } from "../../titles";
import { requireClientToken, type ClientVariables } from "./middleware";
import { t } from "@rimelight/i18n";
import {
  byteLength,
  mergeTitleSettings,
  MAX_BODY_BYTES,
  MAX_STORED_BYTES,
  titleSettingsPatchSchema,
} from "./title-settings";

class PayloadTooLargeError extends Error {}

/**
 * Rimelight client API, version 1. Account-level routes are shared by every title. Settings are
 * per title: `/titles/:title/settings`.
 */
const v1 = new Hono<{ Bindings: Env; Variables: ClientVariables }>();

v1.use("*", requireClientToken);

v1.get("/profile", (c) => {
  const user = c.var.user;
  return c.json({
    id: user.id,
    email: user.email,
    name: user.name,
    tag: user.tag,
    created_at: user.createdAt,
  });
});

v1.use("/titles/:title/*", async (c, next) => {
  if (!isTitleSlug(c.req.param("title"))) {
    return c.json({ error: "Not Found", message: t("api.message.unknown-title") }, 404);
  }
  return next();
});

v1.get("/titles/:title/settings", async (c) => {
  const db = getDb();
  const [row] = await db
    .select()
    .from(titleSettings)
    .where(
      and(eq(titleSettings.userId, c.var.user.id), eq(titleSettings.title, c.req.param("title"))),
    )
    .limit(1);
  return c.json({ success: true, version: row?.version ?? 0, settings: row?.settings ?? {} });
});

v1.put("/titles/:title/settings", async (c) => {
  const title = c.req.param("title");
  const raw = await c.req.text();
  if (new TextEncoder().encode(raw).length > MAX_BODY_BYTES) {
    return c.json({ error: "Payload Too Large", message: t("api.message.body-too-large") }, 413);
  }

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return c.json({ error: "Bad Request", message: t("api.message.body-must-be-json") }, 400);
  }

  const parsed = titleSettingsPatchSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: "Bad Request", message: t("api.message.settings-invalid") }, 400);
  }

  const db = getDb();
  const userId = c.var.user.id;
  const key = and(eq(titleSettings.userId, userId), eq(titleSettings.title, title));

  try {
    const updated = await db.transaction(async (tx) => {
      // Create the row first. FOR UPDATE locks nothing when no row exists yet.
      await tx.insert(titleSettings).values({ userId, title }).onConflictDoNothing();
      const [row] = await tx.select().from(titleSettings).where(key).for("update");

      const merged = mergeTitleSettings(row!.settings, parsed.data);
      if (byteLength(merged) > MAX_STORED_BYTES) throw new PayloadTooLargeError();

      const [result] = await tx
        .update(titleSettings)
        .set({
          settings: merged,
          version: sql`${titleSettings.version} + 1`,
          updatedAt: new Date(),
        })
        .where(key)
        .returning();
      return result!;
    });

    return c.json({ success: true, version: updated.version, settings: updated.settings });
  } catch (err) {
    if (err instanceof PayloadTooLargeError) {
      return c.json(
        { error: "Payload Too Large", message: t("api.message.stored-settings-too-large") },
        413,
      );
    }
    throw err;
  }
});

/** Balances for every currency of the title. A currency the player has never been granted reads as zero. */
v1.get("/titles/:title/currencies", async (c) => {
  const title = c.req.param("title");
  if (!isTitleSlug(title)) {
    return c.json({ error: "Not Found", message: t("api.message.unknown-title") }, 404);
  }

  const db = getDb();
  const rows = await db
    .select()
    .from(titleCurrencies)
    .where(and(eq(titleCurrencies.userId, c.var.user.id), eq(titleCurrencies.title, title)));

  const currencies: Record<string, number> = {};
  for (const id of Object.keys(currencyCapsFor(title))) currencies[id] = 0;
  for (const row of rows) currencies[row.currencyId] = row.amount;
  return c.json({ success: true, currencies });
});

const adjustSchema = z.object({
  currency: z.string().uuid(),
  delta: z.number().int().min(-1_000_000_000).max(1_000_000_000),
});

/**
 * Grants (positive delta) or spends (negative) one currency. Admins and owners only: gameplay grants
 * will come from server logic, not from the client. The balance is clamped to its cap and to zero,
 * and the new balance is returned so the caller never has to guess it.
 */
v1.post("/titles/:title/currencies/adjust", async (c) => {
  const title = c.req.param("title");
  if (!isTitleSlug(title)) {
    return c.json({ error: "Not Found", message: t("api.message.unknown-title") }, 404);
  }
  if (!canAdjustCurrency(c.var.user.role)) {
    return c.json({ error: "Forbidden", message: t("api.message.currency-adjust-forbidden") }, 403);
  }

  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "Bad Request", message: t("api.message.body-must-be-json") }, 400);
  }
  const parsed = adjustSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: "Bad Request", message: t("api.message.currency-invalid") }, 400);
  }

  const { currency, delta } = parsed.data;
  const cap = currencyCapsFor(title)[currency];
  if (cap === undefined) {
    return c.json({ error: "Bad Request", message: t("api.message.currency-unknown") }, 400);
  }

  const db = getDb();
  const userId = c.var.user.id;
  const key = and(
    eq(titleCurrencies.userId, userId),
    eq(titleCurrencies.title, title),
    eq(titleCurrencies.currencyId, currency),
  );

  const amount = await db.transaction(async (tx) => {
    await tx
      .insert(titleCurrencies)
      .values({ userId, title, currencyId: currency })
      .onConflictDoNothing();
    const [row] = await tx.select().from(titleCurrencies).where(key).for("update");

    const next = clampBalance(row!.amount + delta, cap);
    await tx.update(titleCurrencies).set({ amount: next, updatedAt: new Date() }).where(key);
    return next;
  });

  return c.json({ success: true, currency, amount, cap });
});

/** Amounts of every item of the title. An item the player has never been granted reads as zero. */
v1.get("/titles/:title/items", async (c) => {
  const title = c.req.param("title");
  if (!isTitleSlug(title)) {
    return c.json({ error: "Not Found", message: t("api.message.unknown-title") }, 404);
  }

  const db = getDb();
  const rows = await db
    .select()
    .from(titleItems)
    .where(and(eq(titleItems.userId, c.var.user.id), eq(titleItems.title, title)));

  const items: Record<string, number> = {};
  for (const id of Object.keys(itemCapsFor(title))) items[id] = 0;
  for (const row of rows) items[row.itemId] = row.amount;
  // The caps come from the server, which is the source of truth. The game clamps to these when signed in.
  return c.json({ success: true, items, caps: itemCapsFor(title) });
});

const itemAdjustSchema = z.object({
  item: z.string().uuid(),
  delta: z.number().int().min(-1_000_000_000).max(1_000_000_000),
});

/**
 * Grants (positive delta) or removes (negative) one item. Admins and owners only, like currency. The
 * amount is clamped to the item's cap and to zero, and the new amount is returned.
 */
v1.post("/titles/:title/items/adjust", async (c) => {
  const title = c.req.param("title");
  if (!isTitleSlug(title)) {
    return c.json({ error: "Not Found", message: t("api.message.unknown-title") }, 404);
  }
  if (!canAdjustCurrency(c.var.user.role)) {
    return c.json({ error: "Forbidden", message: t("api.message.item-adjust-forbidden") }, 403);
  }

  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "Bad Request", message: t("api.message.body-must-be-json") }, 400);
  }
  const parsed = itemAdjustSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: "Bad Request", message: t("api.message.item-invalid") }, 400);
  }

  const { item, delta } = parsed.data;
  const cap = itemCapsFor(title)[item];
  if (cap === undefined) {
    return c.json({ error: "Bad Request", message: t("api.message.item-unknown") }, 400);
  }

  const db = getDb();
  const userId = c.var.user.id;
  const key = and(
    eq(titleItems.userId, userId),
    eq(titleItems.title, title),
    eq(titleItems.itemId, item),
  );

  const amount = await db.transaction(async (tx) => {
    await tx.insert(titleItems).values({ userId, title, itemId: item }).onConflictDoNothing();
    const [row] = await tx.select().from(titleItems).where(key).for("update");

    const next = clampBalance(row!.amount + delta, cap);
    await tx.update(titleItems).set({ amount: next, updatedAt: new Date() }).where(key);
    return next;
  });

  return c.json({ success: true, item, amount, cap });
});

/** Experience in every proficiency of the title. A proficiency the player has never trained reads as zero. */
v1.get("/titles/:title/proficiencies", async (c) => {
  const title = c.req.param("title");
  if (!isTitleSlug(title)) {
    return c.json({ error: "Not Found", message: t("api.message.unknown-title") }, 404);
  }

  const db = getDb();
  const rows = await db
    .select()
    .from(titleProficiencies)
    .where(and(eq(titleProficiencies.userId, c.var.user.id), eq(titleProficiencies.title, title)));

  const experience: Record<string, number> = {};
  for (const id of proficiencyIdsFor(title)) experience[id] = 0;
  for (const row of rows) experience[row.proficiencyId] = row.experience;
  return c.json({ success: true, experience });
});

const proficiencyAdjustSchema = z.object({
  proficiency: z.string().uuid(),
  delta: z.number().int().min(-1_000_000_000).max(1_000_000_000),
});

const proficiencySetSchema = z.object({
  proficiency: z.string().uuid(),
  experience: z.number().int().min(0).max(1_000_000_000),
});

/** Stores an experience total for one proficiency, creating its row on first use. The total is never below zero. */
async function storeProficiencyExperience(
  userId: string,
  title: string,
  proficiency: string,
  compute: (previous: number) => number,
) {
  const db = getDb();
  const key = and(
    eq(titleProficiencies.userId, userId),
    eq(titleProficiencies.title, title),
    eq(titleProficiencies.proficiencyId, proficiency),
  );
  return db.transaction(async (tx) => {
    await tx
      .insert(titleProficiencies)
      .values({ userId, title, proficiencyId: proficiency })
      .onConflictDoNothing();
    const [row] = await tx.select().from(titleProficiencies).where(key).for("update");
    const next = Math.max(0, compute(row!.experience));
    await tx.update(titleProficiencies).set({ experience: next, updatedAt: new Date() }).where(key);
    return next;
  });
}

/**
 * Adds or removes experience in one proficiency. Admins and owners only, like currency and items. Experience
 * past the cap becomes Engram in the game, which reports it through the currency routes, so the server stores
 * the total only and does not convert it a second time.
 */
v1.post("/titles/:title/proficiencies/adjust", async (c) => {
  const title = c.req.param("title");
  if (!isTitleSlug(title)) {
    return c.json({ error: "Not Found", message: t("api.message.unknown-title") }, 404);
  }
  if (!canAdjustCurrency(c.var.user.role)) {
    return c.json(
      { error: "Forbidden", message: t("api.message.proficiency-adjust-forbidden") },
      403,
    );
  }

  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "Bad Request", message: t("api.message.body-must-be-json") }, 400);
  }
  const parsed = proficiencyAdjustSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: "Bad Request", message: t("api.message.proficiency-invalid") }, 400);
  }

  const { proficiency, delta } = parsed.data;
  if (!proficiencyIdsFor(title).includes(proficiency)) {
    return c.json({ error: "Bad Request", message: t("api.message.proficiency-unknown") }, 400);
  }

  const experience = await storeProficiencyExperience(
    c.var.user.id,
    title,
    proficiency,
    (previous) => previous + delta,
  );
  return c.json({ success: true, proficiency, experience });
});

/** Sets one proficiency's experience to an exact total. Admins and owners only. Used by the debug tools. */
v1.post("/titles/:title/proficiencies/set", async (c) => {
  const title = c.req.param("title");
  if (!isTitleSlug(title)) {
    return c.json({ error: "Not Found", message: t("api.message.unknown-title") }, 404);
  }
  if (!canAdjustCurrency(c.var.user.role)) {
    return c.json(
      { error: "Forbidden", message: t("api.message.proficiency-adjust-forbidden") },
      403,
    );
  }

  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "Bad Request", message: t("api.message.body-must-be-json") }, 400);
  }
  const parsed = proficiencySetSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: "Bad Request", message: t("api.message.proficiency-invalid") }, 400);
  }

  const { proficiency, experience } = parsed.data;
  if (!proficiencyIdsFor(title).includes(proficiency)) {
    return c.json({ error: "Bad Request", message: t("api.message.proficiency-unknown") }, 400);
  }

  const stored = await storeProficiencyExperience(
    c.var.user.id,
    title,
    proficiency,
    () => experience,
  );
  return c.json({ success: true, proficiency, experience: stored });
});

/**
 * A change the estate refuses, such as a facility already at its highest level. Thrown inside a transaction, so nothing the
 * change wrote is kept, and caught by the route, which answers with the status and the message.
 */
class EstateRefusal extends Error {
  constructor(
    readonly status: 409 | 400,
    message: string,
  ) {
    super(message);
  }
}

const estateFacilityBodySchema = z.object({ facility: z.string().uuid() });
const estateExpeditionBodySchema = z.object({ expedition: z.string().uuid() });
const estateDispatchBodySchema = z.object({
  expedition: z.string().uuid(),
  tier: z.number().int(),
});
const estateDebugTierBodySchema = z.object({
  facility: z.string().uuid(),
  tier: z.number().int(),
});

/** The unix seconds of a time, which is how the game reads times from the server. */
function unixSeconds(date: Date): number {
  return Math.floor(date.getTime() / 1000);
}

/** One run as the game reads it. A reward of zero means it has not concluded yet. */
function runResponse(row: {
  expeditionId: string;
  tier: number;
  startedAt: Date;
  endsAt: Date;
  reward: number | null;
}) {
  return {
    expedition: row.expeditionId,
    tier: row.tier,
    startedAt: unixSeconds(row.startedAt),
    endsAt: unixSeconds(row.endsAt),
    reward: row.reward ?? 0,
  };
}

/**
 * Makes sure a facility row exists and returns its tier, locking it for the transaction. A facility the player has never
 * levelled is tier 1.
 */
async function lockFacilityTier(
  tx: Parameters<Parameters<ReturnType<typeof getDb>["transaction"]>[0]>[0],
  userId: string,
  title: string,
  facility: string,
): Promise<number> {
  const key = and(
    eq(titleEstateFacilities.userId, userId),
    eq(titleEstateFacilities.title, title),
    eq(titleEstateFacilities.facilityId, facility),
  );
  await tx
    .insert(titleEstateFacilities)
    .values({ userId, title, facilityId: facility })
    .onConflictDoNothing();
  const [row] = await tx.select().from(titleEstateFacilities).where(key).for("update");
  return row!.tier;
}

/**
 * Adds a signed amount to one currency of the player, locking its row. A debit that the balance cannot cover is refused
 * (null), and changes nothing. A credit is clamped to the currency's cap. Returns the balance after the change.
 */
async function adjustCurrencyBalance(
  tx: Parameters<Parameters<ReturnType<typeof getDb>["transaction"]>[0]>[0],
  userId: string,
  title: string,
  currencyId: string,
  delta: number,
): Promise<number | null> {
  const cap = currencyCapsFor(title as TitleSlug)[currencyId];
  if (cap === undefined) {
    throw new Error(`No cap for currency ${currencyId} in ${title}`);
  }
  const key = and(
    eq(titleCurrencies.userId, userId),
    eq(titleCurrencies.title, title),
    eq(titleCurrencies.currencyId, currencyId),
  );
  await tx.insert(titleCurrencies).values({ userId, title, currencyId }).onConflictDoNothing();
  const [row] = await tx.select().from(titleCurrencies).where(key).for("update");
  const next = row!.amount + delta;
  if (delta < 0 && next < 0) {
    return null;
  }
  const stored = clampBalance(next, cap);
  await tx.update(titleCurrencies).set({ amount: stored, updatedAt: new Date() }).where(key);
  return stored;
}

/** Gives the reward of every run that has concluded and has no reward yet, so a reward is generated on conclusion. */
async function settleConcludedRuns(userId: string, title: string, now: Date): Promise<void> {
  const db = getDb();
  const catalog = estateCatalogFor(title as TitleSlug);
  const due = await db
    .select()
    .from(titleEstateExpeditions)
    .where(
      and(
        eq(titleEstateExpeditions.userId, userId),
        eq(titleEstateExpeditions.title, title),
        sql`${titleEstateExpeditions.reward} is null`,
        sql`${titleEstateExpeditions.endsAt} <= ${now}`,
      ),
    );
  for (const row of due) {
    const expedition = catalog.expeditions.find((e) => e.id === row.expeditionId);
    if (!expedition) continue;
    await db
      .update(titleEstateExpeditions)
      .set({ reward: valueForTier(expedition.rewardPerTier, row.tier) })
      .where(
        and(
          eq(titleEstateExpeditions.userId, userId),
          eq(titleEstateExpeditions.title, title),
          eq(titleEstateExpeditions.expeditionId, row.expeditionId),
        ),
      );
  }
}

/** The estate of the player: every facility's tier, and every run that has not been claimed. */
v1.get("/titles/:title/estate", async (c) => {
  const title = c.req.param("title");
  if (!isTitleSlug(title)) {
    return c.json({ error: "Not Found", message: t("api.message.unknown-title") }, 404);
  }

  const userId = c.var.user.id;
  const now = new Date();
  await settleConcludedRuns(userId, title, now);

  const db = getDb();
  const facilityRows = await db
    .select()
    .from(titleEstateFacilities)
    .where(and(eq(titleEstateFacilities.userId, userId), eq(titleEstateFacilities.title, title)));
  const runRows = await db
    .select()
    .from(titleEstateExpeditions)
    .where(and(eq(titleEstateExpeditions.userId, userId), eq(titleEstateExpeditions.title, title)));

  // A facility the player has not levelled is at the lowest tier, so every facility of the title is listed.
  const facilities: Record<string, number> = {};
  for (const facility of estateCatalogFor(title).facilities)
    facilities[facility.id] = ESTATE_MIN_TIER;
  for (const row of facilityRows) facilities[row.facilityId] = row.tier;

  return c.json({ success: true, facilities, expeditions: runRows.map(runResponse) });
});

/** Levels one facility up by one tier, paying its gold. The server prices the level. */
v1.post("/titles/:title/estate/facilities/upgrade", async (c) => {
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
  const parsed = estateFacilityBodySchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: "Bad Request", message: t("api.message.estate-invalid") }, 400);
  }

  const { facility } = parsed.data;
  const definition = estateCatalogFor(title).facilities.find((f) => f.id === facility);
  if (!definition) {
    return c.json({ error: "Bad Request", message: t("api.message.estate-unknown-facility") }, 400);
  }

  const userId = c.var.user.id;
  try {
    const result = await getDb().transaction(async (tx) => {
      const tier = await lockFacilityTier(tx, userId, title, facility);
      if (tier >= ESTATE_MAX_TIER) {
        throw new EstateRefusal(409, t("api.message.estate-max-level"));
      }
      const cost = valueForTier(definition.goldPerTier, tier + 1);
      const gold = await adjustCurrencyBalance(tx, userId, title, GOLD_CURRENCY_ID, -cost);
      if (gold === null) {
        throw new EstateRefusal(409, t("api.message.estate-not-enough-gold"));
      }
      await tx
        .update(titleEstateFacilities)
        .set({ tier: tier + 1, updatedAt: new Date() })
        .where(
          and(
            eq(titleEstateFacilities.userId, userId),
            eq(titleEstateFacilities.title, title),
            eq(titleEstateFacilities.facilityId, facility),
          ),
        );
      return { tier: tier + 1, gold };
    });
    return c.json({
      success: true,
      facility,
      tier: result.tier,
      balances: { [GOLD_CURRENCY_ID]: result.gold },
    });
  } catch (err) {
    if (err instanceof EstateRefusal) {
      return c.json({ error: "Conflict", message: err.message }, err.status);
    }
    throw err;
  }
});

/** Sends an expedition at a tier. The server checks the facility's tier and the gold, and sets when it concludes. */
v1.post("/titles/:title/estate/expeditions/dispatch", async (c) => {
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
  const parsed = estateDispatchBodySchema.safeParse(body);
  if (!parsed.success || !isEstateTier(parsed.data.tier)) {
    return c.json({ error: "Bad Request", message: t("api.message.estate-invalid") }, 400);
  }

  const { expedition, tier } = parsed.data;
  const definition = estateCatalogFor(title).expeditions.find((e) => e.id === expedition);
  if (!definition) {
    return c.json(
      { error: "Bad Request", message: t("api.message.estate-unknown-expedition") },
      400,
    );
  }

  const userId = c.var.user.id;
  try {
    const result = await getDb().transaction(async (tx) => {
      const facilityTier = await lockFacilityTier(tx, userId, title, definition.facilityId);
      if (tier > facilityTier) {
        throw new EstateRefusal(409, t("api.message.estate-facility-too-low"));
      }

      // One run per expedition: an insert that finds one already there is refused, so two sends cannot both land.
      const startedAt = new Date();
      const endsAt = concludesAt(startedAt);
      const inserted = await tx
        .insert(titleEstateExpeditions)
        .values({ userId, title, expeditionId: expedition, tier, startedAt, endsAt })
        .onConflictDoNothing()
        .returning();
      if (inserted.length === 0) {
        throw new EstateRefusal(409, t("api.message.estate-already-out"));
      }

      const cost = valueForTier(definition.goldPerTier, tier);
      const gold = await adjustCurrencyBalance(tx, userId, title, GOLD_CURRENCY_ID, -cost);
      if (gold === null) {
        throw new EstateRefusal(409, t("api.message.estate-not-enough-gold"));
      }
      return { run: inserted[0]!, gold };
    });
    return c.json({
      success: true,
      run: runResponse({ ...result.run, reward: null }),
      balances: { [GOLD_CURRENCY_ID]: result.gold },
    });
  } catch (err) {
    if (err instanceof EstateRefusal) {
      return c.json({ error: "Conflict", message: err.message }, err.status);
    }
    throw err;
  }
});

/** Recalls a running expedition, refunding its gold. A concluded expedition cannot be recalled. */
v1.post("/titles/:title/estate/expeditions/cancel", async (c) => {
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
  const parsed = estateExpeditionBodySchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: "Bad Request", message: t("api.message.estate-invalid") }, 400);
  }

  const { expedition } = parsed.data;
  const definition = estateCatalogFor(title).expeditions.find((e) => e.id === expedition);
  if (!definition) {
    return c.json(
      { error: "Bad Request", message: t("api.message.estate-unknown-expedition") },
      400,
    );
  }

  const userId = c.var.user.id;
  const key = and(
    eq(titleEstateExpeditions.userId, userId),
    eq(titleEstateExpeditions.title, title),
    eq(titleEstateExpeditions.expeditionId, expedition),
  );
  try {
    const gold = await getDb().transaction(async (tx) => {
      const [run] = await tx.select().from(titleEstateExpeditions).where(key).for("update");
      if (!run) {
        throw new EstateRefusal(409, t("api.message.estate-not-out"));
      }
      if (hasConcluded(run.endsAt, new Date())) {
        throw new EstateRefusal(409, t("api.message.estate-already-concluded"));
      }
      await tx.delete(titleEstateExpeditions).where(key);
      return adjustCurrencyBalance(
        tx,
        userId,
        title,
        GOLD_CURRENCY_ID,
        valueForTier(definition.goldPerTier, run.tier),
      );
    });
    return c.json({ success: true, expedition, balances: { [GOLD_CURRENCY_ID]: gold } });
  } catch (err) {
    if (err instanceof EstateRefusal) {
      return c.json({ error: "Conflict", message: err.message }, err.status);
    }
    throw err;
  }
});

/** Takes the reward of a concluded expedition and removes the run. */
v1.post("/titles/:title/estate/expeditions/claim", async (c) => {
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
  const parsed = estateExpeditionBodySchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: "Bad Request", message: t("api.message.estate-invalid") }, 400);
  }

  const { expedition } = parsed.data;
  const definition = estateCatalogFor(title).expeditions.find((e) => e.id === expedition);
  if (!definition) {
    return c.json(
      { error: "Bad Request", message: t("api.message.estate-unknown-expedition") },
      400,
    );
  }

  const userId = c.var.user.id;
  const key = and(
    eq(titleEstateExpeditions.userId, userId),
    eq(titleEstateExpeditions.title, title),
    eq(titleEstateExpeditions.expeditionId, expedition),
  );
  try {
    const result = await getDb().transaction(async (tx) => {
      const [run] = await tx.select().from(titleEstateExpeditions).where(key).for("update");
      if (!run) {
        throw new EstateRefusal(409, t("api.message.estate-not-out"));
      }
      if (!hasConcluded(run.endsAt, new Date())) {
        throw new EstateRefusal(409, t("api.message.estate-not-concluded"));
      }
      const reward = run.reward ?? valueForTier(definition.rewardPerTier, run.tier);
      await tx.delete(titleEstateExpeditions).where(key);
      const balance = await adjustCurrencyBalance(
        tx,
        userId,
        title,
        definition.rewardCurrencyId,
        reward,
      );
      return { reward, balance: balance ?? 0 };
    });
    return c.json({
      success: true,
      expedition,
      reward: result.reward,
      balances: { [definition.rewardCurrencyId]: result.balance },
    });
  } catch (err) {
    if (err instanceof EstateRefusal) {
      return c.json({ error: "Conflict", message: err.message }, err.status);
    }
    throw err;
  }
});

/** Debug: sets a facility to an exact tier, with no cost. Admins and owners only. */
v1.post("/titles/:title/estate/debug/facilities/set", async (c) => {
  const title = c.req.param("title");
  if (!isTitleSlug(title)) {
    return c.json({ error: "Not Found", message: t("api.message.unknown-title") }, 404);
  }
  if (!canUseEstateDebug(c.var.user.role)) {
    return c.json({ error: "Forbidden", message: t("api.message.estate-debug-forbidden") }, 403);
  }

  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "Bad Request", message: t("api.message.body-must-be-json") }, 400);
  }
  const parsed = estateDebugTierBodySchema.safeParse(body);
  if (!parsed.success || !isEstateTier(parsed.data.tier)) {
    return c.json({ error: "Bad Request", message: t("api.message.estate-invalid") }, 400);
  }

  const { facility, tier } = parsed.data;
  if (!estateCatalogFor(title).facilities.some((f) => f.id === facility)) {
    return c.json({ error: "Bad Request", message: t("api.message.estate-unknown-facility") }, 400);
  }

  const userId = c.var.user.id;
  await getDb()
    .insert(titleEstateFacilities)
    .values({ userId, title, facilityId: facility, tier, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: [
        titleEstateFacilities.userId,
        titleEstateFacilities.title,
        titleEstateFacilities.facilityId,
      ],
      set: { tier, updatedAt: new Date() },
    });
  return c.json({ success: true, facility, tier });
});

/** Debug: ends a running expedition now, so its reward is ready to claim. Admins and owners only. */
v1.post("/titles/:title/estate/debug/expeditions/conclude", async (c) => {
  const title = c.req.param("title");
  if (!isTitleSlug(title)) {
    return c.json({ error: "Not Found", message: t("api.message.unknown-title") }, 404);
  }
  if (!canUseEstateDebug(c.var.user.role)) {
    return c.json({ error: "Forbidden", message: t("api.message.estate-debug-forbidden") }, 403);
  }

  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "Bad Request", message: t("api.message.body-must-be-json") }, 400);
  }
  const parsed = estateExpeditionBodySchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: "Bad Request", message: t("api.message.estate-invalid") }, 400);
  }

  const { expedition } = parsed.data;
  const definition = estateCatalogFor(title).expeditions.find((e) => e.id === expedition);
  if (!definition) {
    return c.json(
      { error: "Bad Request", message: t("api.message.estate-unknown-expedition") },
      400,
    );
  }

  const userId = c.var.user.id;
  const key = and(
    eq(titleEstateExpeditions.userId, userId),
    eq(titleEstateExpeditions.title, title),
    eq(titleEstateExpeditions.expeditionId, expedition),
  );
  try {
    const result = await getDb().transaction(async (tx) => {
      const [run] = await tx.select().from(titleEstateExpeditions).where(key).for("update");
      if (!run) {
        throw new EstateRefusal(409, t("api.message.estate-not-out"));
      }
      const now = new Date();
      const reward = run.reward ?? valueForTier(definition.rewardPerTier, run.tier);
      const [updated] = await tx
        .update(titleEstateExpeditions)
        .set({ endsAt: now, reward })
        .where(key)
        .returning();
      return updated!;
    });
    return c.json({
      success: true,
      run: runResponse(result),
      reward: result.reward ?? 0,
      balances: {},
    });
  } catch (err) {
    if (err instanceof EstateRefusal) {
      return c.json({ error: "Conflict", message: err.message }, err.status);
    }
    throw err;
  }
});

export default v1;
