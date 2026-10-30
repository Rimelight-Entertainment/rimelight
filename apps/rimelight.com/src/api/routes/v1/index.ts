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
import { isTitleSlug } from "../../titles";
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

export default v1;
