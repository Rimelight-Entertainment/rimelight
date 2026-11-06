/**
 * The Grand Estate's rules that the web API needs to store a change: the tier range, the daily reset, and the gate. The
 * prices, costs and rewards are not here. The game server prices every change from the game's assets and sends the gate
 * conditions it evaluated with the change. The web API checks each condition against the state it stores, and does not
 * price anything itself.
 */

export const ESTATE_MIN_TIER = 1;
export const ESTATE_MAX_TIER = 15;

/** Whether a number is a tier the estate allows: a whole number from 1 to 15. */
export function isEstateTier(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value >= ESTATE_MIN_TIER &&
    value <= ESTATE_MAX_TIER
  );
}

/** Whether a run has concluded at a moment. It concludes at its end, and stays concluded until it is claimed. */
export function hasConcluded(endsAt: Date, now: Date): boolean {
  return now.getTime() >= endsAt.getTime();
}

/** The most researches that can run at once. Each research counts once. */
export const MAX_PARALLEL_RESEARCH = 5;

/** Whether another research may start, given how many are already running. */
export function canStartResearch(running: number): boolean {
  return running >= 0 && running < MAX_PARALLEL_RESEARCH;
}

/**
 * One gate condition as the game server sends it. The server evaluates the conditions of a step (an upgrade or a research
 * start) and sends the list; the web API checks each one against its stored state. `subject` is the uuid of the facility,
 * research or currency a condition reads. `tag` is set only for a `hasTag` condition, which the web API does not hold state for.
 */
export type GateCondition =
  | {
      kind: "facilityTier" | "hasCompletedResearch" | "balance" | "level";
      subject: string;
      tag: null;
      value: number;
    }
  | { kind: "hasTag"; subject: null; tag: string; value: number };

/** The player's stored state that a gate reads. The route fills it from the database, inside the change's transaction. */
export type GateState = {
  /** The tier of each facility the player has a row for. A facility with no row has never been levelled, so it is tier 1. */
  facilityTiers: ReadonlyMap<string, number>;
  /** The research ids the player has completed. */
  completedResearch: ReadonlySet<string>;
  /** The amount held of each currency the title caps. A currency absent from this map is unknown, and is refused. */
  balances: ReadonlyMap<string, number>;
};

export type GateReason =
  | "below-tier"
  | "not-completed"
  | "below-balance"
  | "unknown-currency"
  | "unsupported";

export type GateResult =
  | { passed: true }
  | {
      passed: false;
      /** The position of the first failing condition in the list. */
      index: number;
      /** The kind of that condition. */
      kind: GateCondition["kind"];
      reason: GateReason;
    };

/**
 * Checks each condition in order against the stored state, and returns the first that fails. An empty list passes.
 *
 * `level` and `hasTag` are refused: the web API holds no proficiency curve and no owned tags, so it cannot check them. Refusing
 * them is the fail-closed choice. A condition on a currency the title does not cap is refused, as an unknown currency.
 */
export function evaluateGate(conditions: readonly GateCondition[], state: GateState): GateResult {
  for (const [index, condition] of conditions.entries()) {
    const reason = gateFailure(condition, state);
    if (reason !== null) return { passed: false, index, kind: condition.kind, reason };
  }
  return { passed: true };
}

/** Why one condition fails, or null when it holds. */
function gateFailure(condition: GateCondition, state: GateState): GateReason | null {
  switch (condition.kind) {
    case "facilityTier": {
      const tier = state.facilityTiers.get(condition.subject) ?? ESTATE_MIN_TIER;
      return tier >= condition.value ? null : "below-tier";
    }
    case "hasCompletedResearch":
      return state.completedResearch.has(condition.subject) ? null : "not-completed";
    case "balance": {
      const amount = state.balances.get(condition.subject);
      if (amount === undefined) return "unknown-currency";
      return amount >= condition.value ? null : "below-balance";
    }
    case "level":
    case "hasTag":
      return "unsupported";
  }
}
