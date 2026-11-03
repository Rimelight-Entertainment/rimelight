/**
 * The Grand Estate's rules that the web API needs to store a change: the tier range, and the daily reset. The prices, costs
 * and rewards are not here. The game server prices every change from the game's assets, so nothing in the web API depends on a
 * table of numbers.
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
