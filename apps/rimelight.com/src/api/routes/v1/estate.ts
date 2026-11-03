import { Hono } from "hono";
import { and, eq, sql } from "drizzle-orm";
import { getDb } from "#db";
import { titleEstateExpeditions, titleEstateFacilities } from "#db/schema/title-estate";
import { titleCurrencies } from "#db/schema/title-currencies";
import { z } from "zod";
import { t } from "@rimelight/i18n";
import { clampBalance, currencyCapsFor } from "../../title-currencies";
import { ESTATE_MIN_TIER, hasConcluded, isEstateTier } from "../../title-estate";
import { isTitleSlug, type TitleSlug } from "../../titles";
import { requireClientToken, type ClientVariables } from "./middleware";
import { requireEstateServer } from "./estate-server-auth";

/**
 * The Grand Estate on the web API. The game server prices every change from the game's assets, checks it, and then calls the
 * write routes under `/server/` with what it decided. The web API stores that decision in one transaction and does not price
 * anything itself. A player reads their estate here.
 */
type Tx = Parameters<Parameters<ReturnType<typeof getDb>["transaction"]>[0]>[0];

/** A change the estate refuses, such as a facility that is not one tier below the new level. Thrown inside a transaction, so nothing it wrote is kept. */
class EstateRefusal extends Error {
  constructor(
    readonly status: 409,
    message: string,
  ) {
    super(message);
  }
}

const uuid = z.string().uuid();
const serverUser = z.object({ userId: uuid });

const upgradeSchema = serverUser.extend({
  facility: uuid,
  tier: z.number().int(),
  cost: z.number().int().min(0),
  goldCurrency: uuid,
});
const dispatchSchema = serverUser.extend({
  expedition: uuid,
  facility: uuid,
  tier: z.number().int(),
  cost: z.number().int().min(0),
  reward: z.number().int().min(0),
  goldCurrency: uuid,
  startedAt: z.number().int(),
  endsAt: z.number().int(),
});
const cancelSchema = serverUser.extend({
  expedition: uuid,
  refund: z.number().int().min(0),
  goldCurrency: uuid,
});
const claimSchema = serverUser.extend({
  expedition: uuid,
  rewardCurrency: uuid,
});
const endNowSchema = serverUser.extend({ expedition: uuid });

function unixSeconds(date: Date): number {
  return Math.floor(date.getTime() / 1000);
}

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

/** Makes sure a facility row exists and returns its tier, locking it for the transaction. A facility never levelled is tier 1. */
async function lockFacilityTier(
  tx: Tx,
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
 * Adds a signed amount to one currency of the player, locking its row. A debit the balance cannot cover is refused (null) and
 * changes nothing. A credit is clamped to the currency's cap. Returns the balance after the change.
 */
async function adjustCurrencyBalance(
  tx: Tx,
  userId: string,
  title: string,
  currencyId: string,
  delta: number,
): Promise<number | null> {
  const cap = currencyCapsFor(title as TitleSlug)[currencyId];
  if (cap === undefined) {
    throw new EstateRefusal(409, t("api.message.estate-unknown-currency"));
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

function runKey(userId: string, title: string, expedition: string) {
  return and(
    eq(titleEstateExpeditions.userId, userId),
    eq(titleEstateExpeditions.title, title),
    eq(titleEstateExpeditions.expeditionId, expedition),
  );
}

/** Parses a JSON body against a schema. Returns the parsed data, or the response to send back. */
async function readBody<T extends z.ZodType>(
  request: { json: () => Promise<unknown> },
  schema: T,
): Promise<{ ok: true; data: z.infer<T> } | { ok: false; error: string; message: string }> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return { ok: false, error: "Bad Request", message: t("api.message.body-must-be-json") };
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return { ok: false, error: "Bad Request", message: t("api.message.estate-invalid") };
  }
  return { ok: true, data: parsed.data };
}

export const estateRoutes = new Hono<{ Bindings: Env; Variables: ClientVariables }>();

/** The estate of the signed-in player: every facility's tier, and every run that has not been claimed. */
estateRoutes.get("/titles/:title/estate", requireClientToken, async (c) => {
  const title = c.req.param("title");
  if (!isTitleSlug(title)) {
    return c.json({ error: "Not Found", message: t("api.message.unknown-title") }, 404);
  }

  const userId = c.var.user.id;
  const db = getDb();
  const facilityRows = await db
    .select()
    .from(titleEstateFacilities)
    .where(and(eq(titleEstateFacilities.userId, userId), eq(titleEstateFacilities.title, title)));
  const runRows = await db
    .select()
    .from(titleEstateExpeditions)
    .where(and(eq(titleEstateExpeditions.userId, userId), eq(titleEstateExpeditions.title, title)));

  const facilities: Record<string, number> = {};
  for (const row of facilityRows) facilities[row.facilityId] = row.tier;
  return c.json({ success: true, facilities, expeditions: runRows.map(runResponse) });
});

/** Records a facility level the game server has priced and checked. The facility must be exactly one tier below the new level. */
estateRoutes.post(
  "/titles/:title/estate/server/facilities/upgrade",
  requireEstateServer,
  async (c) => {
    const title = c.req.param("title");
    if (!isTitleSlug(title)) {
      return c.json({ error: "Not Found", message: t("api.message.unknown-title") }, 404);
    }
    const body = await readBody(c.req, upgradeSchema);
    if (!body.ok) return c.json({ error: body.error, message: body.message }, 400);
    const { userId, facility, tier, cost, goldCurrency } = body.data;
    if (!isEstateTier(tier) || tier <= ESTATE_MIN_TIER) {
      return c.json({ error: "Bad Request", message: t("api.message.estate-invalid") }, 400);
    }

    try {
      const gold = await getDb().transaction(async (tx) => {
        const current = await lockFacilityTier(tx, userId, title, facility);
        if (current !== tier - 1) {
          throw new EstateRefusal(409, t("api.message.estate-tier-out-of-date"));
        }
        const balance = await adjustCurrencyBalance(tx, userId, title, goldCurrency, -cost);
        if (balance === null) {
          throw new EstateRefusal(409, t("api.message.estate-not-enough-gold"));
        }
        await tx
          .update(titleEstateFacilities)
          .set({ tier, updatedAt: new Date() })
          .where(
            and(
              eq(titleEstateFacilities.userId, userId),
              eq(titleEstateFacilities.title, title),
              eq(titleEstateFacilities.facilityId, facility),
            ),
          );
        return balance;
      });
      return c.json({ success: true, facility, tier, balances: { [goldCurrency]: gold } });
    } catch (err) {
      if (err instanceof EstateRefusal)
        return c.json({ error: "Conflict", message: err.message }, err.status);
      throw err;
    }
  },
);

/** Records a sent expedition. One run per expedition: a second send is refused while one is out. */
estateRoutes.post(
  "/titles/:title/estate/server/expeditions/dispatch",
  requireEstateServer,
  async (c) => {
    const title = c.req.param("title");
    if (!isTitleSlug(title)) {
      return c.json({ error: "Not Found", message: t("api.message.unknown-title") }, 404);
    }
    const body = await readBody(c.req, dispatchSchema);
    if (!body.ok) return c.json({ error: body.error, message: body.message }, 400);
    const { userId, expedition, facility, tier, cost, reward, goldCurrency, startedAt, endsAt } =
      body.data;
    if (!isEstateTier(tier)) {
      return c.json({ error: "Bad Request", message: t("api.message.estate-invalid") }, 400);
    }

    try {
      const result = await getDb().transaction(async (tx) => {
        const facilityTier = await lockFacilityTier(tx, userId, title, facility);
        if (tier > facilityTier) {
          throw new EstateRefusal(409, t("api.message.estate-facility-too-low"));
        }
        const inserted = await tx
          .insert(titleEstateExpeditions)
          .values({
            userId,
            title,
            expeditionId: expedition,
            tier,
            startedAt: new Date(startedAt * 1000),
            endsAt: new Date(endsAt * 1000),
            reward,
          })
          .onConflictDoNothing()
          .returning();
        if (inserted.length === 0) {
          throw new EstateRefusal(409, t("api.message.estate-already-out"));
        }
        const balance = await adjustCurrencyBalance(tx, userId, title, goldCurrency, -cost);
        if (balance === null) {
          throw new EstateRefusal(409, t("api.message.estate-not-enough-gold"));
        }
        return { row: inserted[0]!, balance };
      });
      return c.json({
        success: true,
        run: runResponse(result.row),
        balances: { [goldCurrency]: result.balance },
      });
    } catch (err) {
      if (err instanceof EstateRefusal)
        return c.json({ error: "Conflict", message: err.message }, err.status);
      throw err;
    }
  },
);

/** Records a recall: the run is removed and its gold refunded. A concluded run cannot be recalled. */
estateRoutes.post(
  "/titles/:title/estate/server/expeditions/cancel",
  requireEstateServer,
  async (c) => {
    const title = c.req.param("title");
    if (!isTitleSlug(title)) {
      return c.json({ error: "Not Found", message: t("api.message.unknown-title") }, 404);
    }
    const body = await readBody(c.req, cancelSchema);
    if (!body.ok) return c.json({ error: body.error, message: body.message }, 400);
    const { userId, expedition, refund, goldCurrency } = body.data;

    try {
      const balance = await getDb().transaction(async (tx) => {
        const [run] = await tx
          .select()
          .from(titleEstateExpeditions)
          .where(runKey(userId, title, expedition))
          .for("update");
        if (!run) throw new EstateRefusal(409, t("api.message.estate-not-out"));
        if (hasConcluded(run.endsAt, new Date()))
          throw new EstateRefusal(409, t("api.message.estate-already-concluded"));
        await tx.delete(titleEstateExpeditions).where(runKey(userId, title, expedition));
        return adjustCurrencyBalance(tx, userId, title, goldCurrency, refund);
      });
      return c.json({ success: true, expedition, balances: { [goldCurrency]: balance ?? 0 } });
    } catch (err) {
      if (err instanceof EstateRefusal)
        return c.json({ error: "Conflict", message: err.message }, err.status);
      throw err;
    }
  },
);

/** Records a claim: the concluded run is removed and its stored reward is credited in the reward currency. */
estateRoutes.post(
  "/titles/:title/estate/server/expeditions/claim",
  requireEstateServer,
  async (c) => {
    const title = c.req.param("title");
    if (!isTitleSlug(title)) {
      return c.json({ error: "Not Found", message: t("api.message.unknown-title") }, 404);
    }
    const body = await readBody(c.req, claimSchema);
    if (!body.ok) return c.json({ error: body.error, message: body.message }, 400);
    const { userId, expedition, rewardCurrency } = body.data;

    try {
      const result = await getDb().transaction(async (tx) => {
        const [run] = await tx
          .select()
          .from(titleEstateExpeditions)
          .where(runKey(userId, title, expedition))
          .for("update");
        if (!run) throw new EstateRefusal(409, t("api.message.estate-not-out"));
        if (!hasConcluded(run.endsAt, new Date()))
          throw new EstateRefusal(409, t("api.message.estate-not-concluded"));
        const reward = run.reward ?? 0;
        await tx.delete(titleEstateExpeditions).where(runKey(userId, title, expedition));
        const balance = await adjustCurrencyBalance(tx, userId, title, rewardCurrency, reward);
        return { reward, balance: balance ?? 0 };
      });
      return c.json({
        success: true,
        expedition,
        reward: result.reward,
        balances: { [rewardCurrency]: result.balance },
      });
    } catch (err) {
      if (err instanceof EstateRefusal)
        return c.json({ error: "Conflict", message: err.message }, err.status);
      throw err;
    }
  },
);

/** Debug: ends a running expedition now, so the game server concludes it on its next check. */
estateRoutes.post(
  "/titles/:title/estate/server/expeditions/end-now",
  requireEstateServer,
  async (c) => {
    const title = c.req.param("title");
    if (!isTitleSlug(title)) {
      return c.json({ error: "Not Found", message: t("api.message.unknown-title") }, 404);
    }
    const body = await readBody(c.req, endNowSchema);
    if (!body.ok) return c.json({ error: body.error, message: body.message }, 400);
    const { userId, expedition } = body.data;

    const updated = await getDb()
      .update(titleEstateExpeditions)
      .set({ endsAt: sql`now()` })
      .where(runKey(userId, title, expedition))
      .returning();
    if (updated.length === 0) {
      return c.json({ error: "Conflict", message: t("api.message.estate-not-out") }, 409);
    }
    return c.json({ success: true, run: runResponse(updated[0]!) });
  },
);
