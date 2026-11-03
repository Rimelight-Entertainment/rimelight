import type { TitleSlug } from "./titles";
import estateTables from "./title-estate.json";

/**
 * The Grand Estate: the facilities a player levels, and the expeditions they send. The game's assets are the source of truth:
 * `title-estate.json` is exported from them by GrandTale/Scripts/create_estate_assets.py. Tune the assets, run the script, and
 * commit the JSON. Nothing here is hand-written.
 *
 * Each table is per tier: entry N is the value for tier N + 1, so there are fifteen entries.
 */

export const ESTATE_MIN_TIER = 1;
export const ESTATE_MAX_TIER = 15;

/** The gold currency. Facility levels and expeditions are paid in it. */
export const GOLD_CURRENCY_ID: string = estateTables.goldCurrencyId;

export interface FacilityDefinition {
  id: string;
  /** The gold to reach each tier. Entry N is the cost of tier N + 1, so the first entry (tier 1) is free. */
  goldPerTier: number[];
}

export interface ExpeditionDefinition {
  id: string;
  /** The facility that unlocks it. The expedition's tier can be no higher than the facility's. */
  facilityId: string;
  /** The gold to send it at each tier. */
  goldPerTier: number[];
  /** The reward at each tier, paid in the reward currency when the expedition is claimed. */
  rewardPerTier: number[];
  rewardCurrencyId: string;
}

export interface EstateCatalog {
  facilities: FacilityDefinition[];
  expeditions: ExpeditionDefinition[];
}

const CATALOG: Record<TitleSlug, EstateCatalog> = {
  "grand-tale": {
    facilities: estateTables.facilities.map((f) => ({ id: f.id, goldPerTier: f.goldPerTier })),
    expeditions: estateTables.expeditions.map((e) => ({
      id: e.id,
      facilityId: e.facilityId,
      goldPerTier: e.goldPerTier,
      rewardPerTier: e.rewardPerTier,
      rewardCurrencyId: e.rewardCurrencyId,
    })),
  },
};

export function estateCatalogFor(title: TitleSlug): EstateCatalog {
  return CATALOG[title];
}

/** The value in a per-tier table for a tier. A tier outside the table reads as zero. */
export function valueForTier(perTier: number[], tier: number): number {
  return perTier[tier - ESTATE_MIN_TIER] ?? 0;
}

/** Whether a number is a tier the estate allows: a whole number from 1 to 15. */
export function isEstateTier(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value >= ESTATE_MIN_TIER &&
    value <= ESTATE_MAX_TIER
  );
}

/**
 * When an expedition sent at a moment concludes: the next midnight UTC after it. Sent exactly at midnight, it concludes a full
 * day later.
 */
export function concludesAt(sentAt: Date): Date {
  return new Date(Date.UTC(sentAt.getUTCFullYear(), sentAt.getUTCMonth(), sentAt.getUTCDate() + 1));
}

/** Whether a run has concluded at a moment. It concludes at its end, and stays concluded until it is claimed. */
export function hasConcluded(endsAt: Date, now: Date): boolean {
  return now.getTime() >= endsAt.getTime();
}

/** Roles allowed to change the estate directly, for the debug tools. Players never hold these. */
const DEBUG_ROLES = new Set(["admin", "owner"]);

export function canUseEstateDebug(role: string): boolean {
  return DEBUG_ROLES.has(role);
}
