import { Hono } from "hono";
import { and, eq, sql } from "drizzle-orm";
import { getDb } from "#db";
import {
  titleEstateExpeditions,
  titleEstateFacilities,
  titleEstateResearchCompletions,
} from "#db/schema/title-estate";
import { titleLedgerBatches } from "#db/schema/title-ledger";
import { titleCurrencies } from "#db/schema/title-currencies";
import { z } from "zod";
import { t } from "@rimelight/i18n";
import { currencyCapsFor } from "../../title-currencies";
import {
  ESTATE_MIN_TIER,
  canStartResearch,
  evaluateGate,
  hasConcluded,
  isEstateTier,
  type GateCondition,
  type GateReason,
  type GateState,
} from "../../title-estate";
import { isTitleSlug, type TitleSlug } from "../../titles";
import { netBatch, type LedgerBatchEntry } from "../../title-ledger";
import { LedgerRefusal, writeLedgerChanges } from "../../title-ledger-write";
import { requireClientToken, type ClientVariables } from "./middleware";
import { requireGameServer, type GameServerVariables } from "./game-server-auth";

/**
 * The Grand Estate on the web API. The game server prices every change from the game's assets, checks it, and then calls the
 * write routes under `/server/` with what it decided and the gate conditions it evaluated. The web API checks each condition
 * against its stored state, and stores the change in one transaction. It prices nothing itself. A player reads their estate here.
 * Every write carries a `requestId` and is recorded as one ledger batch under it, so a retry replays and never applies twice.
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

/**
 * The gate conditions the game server evaluated for a step. A `hasTag` names a tag and no subject; every other kind names a
 * subject uuid and no tag. A `level` or a `hasTag` is sent but refused, since the web API cannot check it.
 */
const gateConditionSchema = z.union([
  z.object({
    kind: z.enum(["facilityTier", "hasCompletedResearch", "balance", "level"]),
    subject: uuid,
    tag: z.null(),
    value: z.number().int().min(0),
  }),
  z.object({
    kind: z.literal("hasTag"),
    subject: z.null(),
    tag: z.string().min(1),
    value: z.number().int().min(0),
  }),
]);
const gateConditionsSchema = z.array(gateConditionSchema).default([]);

const upgradeSchema = z.object({
  requestId: uuid,
  facility: uuid,
  tier: z.number().int(),
  cost: z.number().int().min(0),
  goldCurrency: uuid,
  blueprintCost: z.number().int().min(0),
  blueprintCurrency: uuid,
  conditions: gateConditionsSchema,
});
const dispatchSchema = z.object({
  requestId: uuid,
  kind: z.enum(["expedition", "research"]),
  expedition: uuid,
  /** The facility an expedition unlocks from. Researches are not tied to a facility. */
  facility: uuid.optional(),
  tier: z.number().int(),
  cost: z.number().int().min(0),
  reward: z.number().int().min(0),
  goldCurrency: uuid,
  startedAt: z.number().int(),
  endsAt: z.number().int(),
  conditions: gateConditionsSchema,
});
const cancelSchema = z.object({
  requestId: uuid,
  expedition: uuid,
  refund: z.number().int().min(0),
  goldCurrency: uuid,
});
const claimSchema = z.object({
  requestId: uuid,
  expedition: uuid,
  rewardCurrency: uuid,
});
const endNowSchema = z.object({ expedition: uuid });

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

/** The JSON text of a value with its object keys sorted, so two requests with the same fields compare equal in any key order. */
function canonicalJson(value: unknown): string {
  return JSON.stringify(value, (_key, item: unknown) =>
    item !== null && typeof item === "object" && !Array.isArray(item)
      ? Object.fromEntries(Object.entries(item).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)))
      : item,
  );
}

/** What one estate change did: the response fields it sends back, and the currency entries it writes to the ledger. */
interface EstateEffect {
  response: Record<string, unknown>;
  entries: LedgerBatchEntry[];
}

/**
 * Applies one game-server estate change as a ledger batch under its request id, in the caller's transaction. The batch row is
 * written first, under the id. A retry with the same id and request returns the stored response and applies nothing. The same
 * id with a different request is refused. Otherwise `apply` makes the change (it may refuse), its currency entries are written
 * to the ledger, and the response is stored on the batch with the request. A refusal rolls back the batch row with the rest.
 */
async function applyEstateChange(
  tx: Tx,
  scope: {
    gameServerId: string;
    userId: string;
    title: string;
    requestId: string;
    request: Record<string, unknown>;
  },
  apply: () => Promise<EstateEffect>,
): Promise<Record<string, unknown>> {
  const { gameServerId, userId, title, requestId, request } = scope;
  const [batch] = await tx
    .insert(titleLedgerBatches)
    .values({ userId, title, requestId, gameServerId, request })
    .onConflictDoNothing({
      target: [titleLedgerBatches.userId, titleLedgerBatches.title, titleLedgerBatches.requestId],
    })
    .returning({ id: titleLedgerBatches.id });
  if (!batch) {
    const [stored] = await tx
      .select()
      .from(titleLedgerBatches)
      .where(
        and(
          eq(titleLedgerBatches.userId, userId),
          eq(titleLedgerBatches.title, title),
          eq(titleLedgerBatches.requestId, requestId),
        ),
      );
    if (!stored?.response || canonicalJson(stored.request) !== canonicalJson(request)) {
      throw new LedgerRefusal(t("api.message.ledger-request-reused"));
    }
    return stored.response;
  }

  const effect = await apply();
  const net = netBatch(effect.entries);
  if (net === null) throw new EstateRefusal(409, t("api.message.estate-invalid"));
  const caps = currencyCapsFor(title as TitleSlug);
  for (const id of net.keys()) {
    if (caps[id] === undefined) {
      throw new EstateRefusal(409, t("api.message.estate-unknown-currency"));
    }
  }
  const balances = await writeLedgerChanges(tx, userId, title, batch.id, net, caps);
  const response = { success: true, ...effect.response, balances: Object.fromEntries(balances) };
  await tx.update(titleLedgerBatches).set({ response }).where(eq(titleLedgerBatches.id, batch.id));
  return response;
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

/**
 * Reads what a gate can check about the player, inside the change's transaction. The rows are read without row locks: the change
 * already locks the facility and the currencies it writes. A facility tier only rises and a completion is only added, so a stale
 * read of either refuses rather than passes. A currency balance can fall under a concurrent spend, so a balance read may lag it
 * by a moment.
 */
async function readGateState(tx: Tx, userId: string, title: string): Promise<GateState> {
  const facilityRows = await tx
    .select()
    .from(titleEstateFacilities)
    .where(and(eq(titleEstateFacilities.userId, userId), eq(titleEstateFacilities.title, title)));
  const researchRows = await tx
    .select()
    .from(titleEstateResearchCompletions)
    .where(
      and(
        eq(titleEstateResearchCompletions.userId, userId),
        eq(titleEstateResearchCompletions.title, title),
      ),
    );
  const currencyRows = await tx
    .select()
    .from(titleCurrencies)
    .where(and(eq(titleCurrencies.userId, userId), eq(titleCurrencies.title, title)));

  // Every currency the title caps is listed, at zero when the player has no row for it. A currency it does not cap is absent,
  // so a gate on it is refused as unknown.
  const held = new Map(currencyRows.map((row): [string, number] => [row.currencyId, row.amount]));
  const balances = new Map<string, number>();
  for (const currencyId of Object.keys(currencyCapsFor(title as TitleSlug))) {
    balances.set(currencyId, held.get(currencyId) ?? 0);
  }
  return {
    facilityTiers: new Map(facilityRows.map((row): [string, number] => [row.facilityId, row.tier])),
    completedResearch: new Set(researchRows.map((row) => row.researchId)),
    balances,
  };
}

/**
 * Checks the gate conditions the game server sent against the player's stored state, and refuses the change at the first that
 * fails. The web API trusts the server to send every condition that applies. A compromised game server can omit a condition, and
 * the web API cannot detect that. This gap is accepted: the web API checks the conditions it is sent.
 */
async function checkGate(
  tx: Tx,
  userId: string,
  title: string,
  conditions: readonly GateCondition[],
): Promise<void> {
  if (conditions.length === 0) return;
  const result = evaluateGate(conditions, await readGateState(tx, userId, title));
  if (!result.passed) throw new EstateRefusal(409, gateMessage(result.reason, result.kind));
}

/** The refusal for a failed gate condition. A level or a tag the web API cannot check names its kind. */
function gateMessage(reason: GateReason, kind: GateCondition["kind"]): string {
  switch (reason) {
    case "below-tier":
      return t("api.message.estate-gate-below-tier");
    case "not-completed":
      return t("api.message.estate-gate-not-completed");
    case "below-balance":
      return t("api.message.estate-gate-below-balance");
    case "unknown-currency":
      return t("api.message.estate-unknown-currency");
    case "unsupported":
      return t("api.message.estate-gate-unsupported", { kind });
  }
}

export const estateRoutes = new Hono<{
  Bindings: Env;
  Variables: ClientVariables & GameServerVariables;
}>();

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

/** Records a facility level the game server has priced and checked. The facility must be exactly one tier below the new level, and its gate conditions must hold. */
estateRoutes.post(
  "/titles/:title/estate/server/facilities/upgrade",
  requireGameServer,
  async (c) => {
    const title = c.req.param("title");
    if (!isTitleSlug(title)) {
      return c.json({ error: "Not Found", message: t("api.message.unknown-title") }, 404);
    }
    const body = await readBody(c.req, upgradeSchema);
    if (!body.ok) return c.json({ error: body.error, message: body.message }, 400);
    const { requestId, ...request } = body.data;
    const userId = c.var.user.id;
    const { facility, tier, cost, goldCurrency, blueprintCost, blueprintCurrency, conditions } =
      request;
    if (!isEstateTier(tier) || tier <= ESTATE_MIN_TIER) {
      return c.json({ error: "Bad Request", message: t("api.message.estate-invalid") }, 400);
    }

    try {
      const response = await getDb().transaction((tx) =>
        applyEstateChange(
          tx,
          { gameServerId: c.var.gameServerId, userId, title, requestId, request },
          async () => {
            const current = await lockFacilityTier(tx, userId, title, facility);
            if (current !== tier - 1) {
              throw new EstateRefusal(409, t("api.message.estate-tier-out-of-date"));
            }
            await checkGate(tx, userId, title, conditions);
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
            // The gold and the Blueprints are spent in one batch, so a level either costs both or neither.
            return {
              response: { facility, tier },
              entries: [
                {
                  kind: "currency",
                  id: goldCurrency,
                  delta: -cost,
                  reason: `estate upgrade ${facility} to tier ${tier}`,
                },
                {
                  kind: "currency",
                  id: blueprintCurrency,
                  delta: -blueprintCost,
                  reason: `estate upgrade ${facility} to tier ${tier}`,
                },
              ],
            };
          },
        ),
      );
      return c.json(response);
    } catch (err) {
      if (err instanceof EstateRefusal)
        return c.json({ error: "Conflict", message: err.message }, err.status);
      if (err instanceof LedgerRefusal)
        return c.json({ error: "Conflict", message: err.message }, 409);
      throw err;
    }
  },
);

/** Records a sent expedition. One run per expedition: a second send is refused while one is out. */
estateRoutes.post(
  "/titles/:title/estate/server/expeditions/dispatch",
  requireGameServer,
  async (c) => {
    const title = c.req.param("title");
    if (!isTitleSlug(title)) {
      return c.json({ error: "Not Found", message: t("api.message.unknown-title") }, 404);
    }
    const body = await readBody(c.req, dispatchSchema);
    if (!body.ok) return c.json({ error: body.error, message: body.message }, 400);
    const { requestId, ...request } = body.data;
    const userId = c.var.user.id;
    const {
      kind,
      expedition,
      facility,
      tier,
      cost,
      reward,
      goldCurrency,
      startedAt,
      endsAt,
      conditions,
    } = request;
    // An expedition unlocks from a facility and carries no gate conditions; a research does not unlock from one, and only a fixed
    // number of them run at once.
    if (
      !isEstateTier(tier) ||
      (kind === "expedition" && (facility === undefined || conditions.length > 0))
    ) {
      return c.json({ error: "Bad Request", message: t("api.message.estate-invalid") }, 400);
    }

    try {
      const response = await getDb().transaction((tx) =>
        applyEstateChange(
          tx,
          { gameServerId: c.var.gameServerId, userId, title, requestId, request },
          async () => {
            if (kind === "expedition") {
              const facilityTier = await lockFacilityTier(tx, userId, title, facility!);
              if (tier > facilityTier) {
                throw new EstateRefusal(409, t("api.message.estate-facility-too-low"));
              }
            } else {
              const running = await tx
                .select({ count: sql<number>`count(*)::int` })
                .from(titleEstateExpeditions)
                .where(
                  and(
                    eq(titleEstateExpeditions.userId, userId),
                    eq(titleEstateExpeditions.title, title),
                    eq(titleEstateExpeditions.kind, "research"),
                  ),
                );
              if (!canStartResearch(running[0]?.count ?? 0)) {
                throw new EstateRefusal(409, t("api.message.estate-research-slots-full"));
              }
              await checkGate(tx, userId, title, conditions);
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
                kind,
              })
              .onConflictDoNothing()
              .returning();
            if (inserted.length === 0) {
              throw new EstateRefusal(409, t("api.message.estate-already-out"));
            }
            return {
              response: { run: runResponse(inserted[0]!) },
              entries: [
                {
                  kind: "currency",
                  id: goldCurrency,
                  delta: -cost,
                  reason: `estate ${kind} ${expedition} tier ${tier}`,
                },
              ],
            };
          },
        ),
      );
      return c.json(response);
    } catch (err) {
      if (err instanceof EstateRefusal)
        return c.json({ error: "Conflict", message: err.message }, err.status);
      if (err instanceof LedgerRefusal)
        return c.json({ error: "Conflict", message: err.message }, 409);
      throw err;
    }
  },
);

/** Records a recall: the run is removed and its gold refunded. A concluded run cannot be recalled. */
estateRoutes.post(
  "/titles/:title/estate/server/expeditions/cancel",
  requireGameServer,
  async (c) => {
    const title = c.req.param("title");
    if (!isTitleSlug(title)) {
      return c.json({ error: "Not Found", message: t("api.message.unknown-title") }, 404);
    }
    const body = await readBody(c.req, cancelSchema);
    if (!body.ok) return c.json({ error: body.error, message: body.message }, 400);
    const { requestId, ...request } = body.data;
    const userId = c.var.user.id;
    const { expedition, refund, goldCurrency } = request;

    try {
      const response = await getDb().transaction((tx) =>
        applyEstateChange(
          tx,
          { gameServerId: c.var.gameServerId, userId, title, requestId, request },
          async () => {
            const [run] = await tx
              .select()
              .from(titleEstateExpeditions)
              .where(runKey(userId, title, expedition))
              .for("update");
            if (!run) throw new EstateRefusal(409, t("api.message.estate-not-out"));
            if (hasConcluded(run.endsAt, new Date()))
              throw new EstateRefusal(409, t("api.message.estate-already-concluded"));
            await tx.delete(titleEstateExpeditions).where(runKey(userId, title, expedition));
            return {
              response: { expedition },
              entries: [
                {
                  kind: "currency",
                  id: goldCurrency,
                  delta: refund,
                  reason: `estate recall ${expedition}`,
                },
              ],
            };
          },
        ),
      );
      return c.json(response);
    } catch (err) {
      if (err instanceof EstateRefusal)
        return c.json({ error: "Conflict", message: err.message }, err.status);
      if (err instanceof LedgerRefusal)
        return c.json({ error: "Conflict", message: err.message }, 409);
      throw err;
    }
  },
);

/** Records a claim: the concluded run is removed and its stored reward is credited in the reward currency. A claimed research is recorded as completed. */
estateRoutes.post(
  "/titles/:title/estate/server/expeditions/claim",
  requireGameServer,
  async (c) => {
    const title = c.req.param("title");
    if (!isTitleSlug(title)) {
      return c.json({ error: "Not Found", message: t("api.message.unknown-title") }, 404);
    }
    const body = await readBody(c.req, claimSchema);
    if (!body.ok) return c.json({ error: body.error, message: body.message }, 400);
    const { requestId, ...request } = body.data;
    const userId = c.var.user.id;
    const { expedition, rewardCurrency } = request;

    try {
      const response = await getDb().transaction((tx) =>
        applyEstateChange(
          tx,
          { gameServerId: c.var.gameServerId, userId, title, requestId, request },
          async () => {
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
            if (run.kind === "research") {
              // Claiming a research is when it completes: its reward is paid here, and the completion is kept for later gates.
              await tx
                .insert(titleEstateResearchCompletions)
                .values({ userId, title, researchId: expedition })
                .onConflictDoNothing();
            }
            return {
              response: { expedition, reward },
              entries: [
                {
                  kind: "currency",
                  id: rewardCurrency,
                  delta: reward,
                  reason: `estate claim ${expedition}`,
                },
              ],
            };
          },
        ),
      );
      return c.json(response);
    } catch (err) {
      if (err instanceof EstateRefusal)
        return c.json({ error: "Conflict", message: err.message }, err.status);
      if (err instanceof LedgerRefusal)
        return c.json({ error: "Conflict", message: err.message }, 409);
      throw err;
    }
  },
);

/** Debug: ends a running expedition now, so the game server concludes it on its next check. */
estateRoutes.post(
  "/titles/:title/estate/server/expeditions/end-now",
  requireGameServer,
  async (c) => {
    const title = c.req.param("title");
    if (!isTitleSlug(title)) {
      return c.json({ error: "Not Found", message: t("api.message.unknown-title") }, 404);
    }
    const body = await readBody(c.req, endNowSchema);
    if (!body.ok) return c.json({ error: body.error, message: body.message }, 400);
    const userId = c.var.user.id;
    const { expedition } = body.data;

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
