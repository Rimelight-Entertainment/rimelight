import type { TitleSlug } from "./titles";

/**
 * The most each currency can hold, per title, keyed by the currency's internal id (a UUIDv4). The server is
 * the source of truth: it enforces these, and the fetch returns them. The game's caps in the currency data
 * table are for display and for local development only. The ids must match the game's currency table.
 */
const CURRENCY_CAPS: Record<TitleSlug, Record<string, number>> = {
  "grand-tale": {
    "c13f3bd2-2c20-47bd-a26e-4f3ae3f7b29c": 999999, // Gold
    "78d63015-cb60-482b-9107-bb72e952ad86": 9999, // Sparks
    "386097ee-8c7a-4d47-a31a-751f30e7ea18": 999999, // Engram
  },
};

export function currencyCapsFor(title: TitleSlug): Record<string, number> {
  return CURRENCY_CAPS[title];
}

/** Roles allowed to grant or spend currency directly. Players never hold these. */
const GRANT_ROLES = new Set(["admin", "owner"]);

export function canAdjustCurrency(role: string): boolean {
  return GRANT_ROLES.has(role);
}

/** Clamps a balance to the currency's range: never below zero, never above its cap. */
export function clampBalance(amount: number, cap: number): number {
  return Math.min(cap, Math.max(0, amount));
}
