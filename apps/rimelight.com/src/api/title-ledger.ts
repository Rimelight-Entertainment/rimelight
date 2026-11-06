/**
 * The rules of a batch of currency and item changes, the same rules the game's wallet applies. The entries for the same
 * currency or item are added up first, and every resulting amount must stay between zero and its cap. One problem refuses
 * the whole batch, so nothing is written.
 */

export interface LedgerEntry {
  /** The currency or item's internal id (a UUIDv4). */
  id: string;
  delta: number;
}

export type LedgerProblem =
  | { ok: true; next: Map<string, number> }
  | { ok: false; id: string; reason: "short" | "over-cap" };

/**
 * Checks a batch against the current amounts and caps. `current` holds every id the batch touches (missing ids read as zero).
 * An id with no cap is not capped. Returns the amounts after the batch, or the first id the batch does not fit.
 */
export function planLedger(
  current: Map<string, number>,
  entries: LedgerEntry[],
  caps: Record<string, number>,
): LedgerProblem {
  const totals = new Map<string, number>();
  for (const entry of entries) {
    totals.set(entry.id, (totals.get(entry.id) ?? 0) + entry.delta);
  }

  const next = new Map<string, number>();
  for (const [id, change] of totals) {
    const result = (current.get(id) ?? 0) + change;
    const cap = caps[id] ?? Number.POSITIVE_INFINITY;
    if (result < 0) return { ok: false, id, reason: "short" };
    if (result > cap) return { ok: false, id, reason: "over-cap" };
    next.set(id, result);
  }
  return { ok: true, next };
}

/** One change in a batch: a currency or item, how much it moves, and the cause the journal keeps for it. */
export interface LedgerBatchEntry {
  kind: "currency" | "item";
  id: string;
  delta: number;
  reason: string;
}

/** One id's net change in a batch: its kind, the sum of its deltas, and its reasons joined with "; ". */
export interface NetLedgerChange {
  kind: LedgerBatchEntry["kind"];
  delta: number;
  reason: string;
}

/**
 * Adds a batch up per id, the way the journal stores it: one net delta per currency or item. The distinct reasons of the
 * changes added up are kept, so a row that holds two drops still names both. Returns null when one id is named as both a
 * currency and an item, which no batch can mean.
 */
export function netBatch(entries: LedgerBatchEntry[]): Map<string, NetLedgerChange> | null {
  const net = new Map<
    string,
    { kind: LedgerBatchEntry["kind"]; delta: number; reasons: string[] }
  >();
  for (const entry of entries) {
    const existing = net.get(entry.id);
    if (existing && existing.kind !== entry.kind) return null;
    const reasons = existing?.reasons ?? [];
    if (!reasons.includes(entry.reason)) reasons.push(entry.reason);
    net.set(entry.id, { kind: entry.kind, delta: (existing?.delta ?? 0) + entry.delta, reasons });
  }
  return new Map(
    [...net].map(([id, change]) => [
      id,
      { kind: change.kind, delta: change.delta, reason: change.reasons.join("; ") },
    ]),
  );
}

/** What a batch with a request id does: apply it, replay the stored result, or refuse because the id was used for other changes. */
export type LedgerRequestDecision = "apply" | "replay" | "conflict";

/**
 * Decides a batch from its request id. `stored` is the batch already recorded under that id, or null when there is none. A
 * retry with the same changes replays; the same id with different changes conflicts; a new id applies.
 */
export function decideLedgerRequest(
  stored: LedgerBatchEntry[] | null,
  incoming: LedgerBatchEntry[],
): LedgerRequestDecision {
  if (stored === null) return "apply";
  const before = netBatch(stored);
  const after = netBatch(incoming);
  if (!before || !after || before.size !== after.size) return "conflict";
  for (const [id, change] of after) {
    const recorded = before.get(id);
    if (!recorded || recorded.kind !== change.kind || recorded.delta !== change.delta) {
      return "conflict";
    }
  }
  return "replay";
}
