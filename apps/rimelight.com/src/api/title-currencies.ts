import type { TitleSlug } from "./titles";

/**
 * The most each currency can hold, per title. This is the server's copy of the caps in the game's
 * currency data table (DT_Currencies). The game's copy is for display; the server enforces these.
 * Keep the two in step when a cap changes.
 */
const CURRENCY_CAPS: Record<TitleSlug, Record<string, number>> = {
  "grand-tale": {
    "Currency.Gold": 999999,
    "Currency.Sparks": 9999,
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
