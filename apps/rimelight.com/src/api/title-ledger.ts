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
