import { describe, expect, it } from "vite-plus/test";
import {
  ESTATE_MAX_TIER,
  GOLD_CURRENCY_ID,
  canUseEstateDebug,
  concludesAt,
  estateCatalogFor,
  hasConcluded,
  isEstateTier,
  valueForTier,
} from "../src/api/title-estate";

const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

describe("estate tables", () => {
  const catalog = estateCatalogFor("grand-tale");

  it("gives every facility and expedition a UUIDv4 and a table for all fifteen tiers", () => {
    for (const facility of catalog.facilities) {
      expect(facility.id).toMatch(UUID_V4);
      expect(facility.goldPerTier).toHaveLength(ESTATE_MAX_TIER);
    }
    for (const expedition of catalog.expeditions) {
      expect(expedition.id).toMatch(UUID_V4);
      expect(expedition.goldPerTier).toHaveLength(ESTATE_MAX_TIER);
      expect(expedition.rewardPerTier).toHaveLength(ESTATE_MAX_TIER);
    }
  });

  it("unlocks each expedition from a facility of the catalogue", () => {
    for (const expedition of catalog.expeditions) {
      expect(catalog.facilities.map((f) => f.id)).toContain(expedition.facilityId);
    }
  });

  it("makes every later tier cost at least as much as the one before", () => {
    for (const facility of catalog.facilities) {
      for (let tier = 2; tier <= ESTATE_MAX_TIER; tier++) {
        expect(valueForTier(facility.goldPerTier, tier)).toBeGreaterThan(
          valueForTier(facility.goldPerTier, tier - 1),
        );
      }
    }
    for (const expedition of catalog.expeditions) {
      for (let tier = 2; tier <= ESTATE_MAX_TIER; tier++) {
        expect(valueForTier(expedition.goldPerTier, tier)).toBeGreaterThan(
          valueForTier(expedition.goldPerTier, tier - 1),
        );
        expect(valueForTier(expedition.rewardPerTier, tier)).toBeGreaterThan(
          valueForTier(expedition.rewardPerTier, tier - 1),
        );
      }
    }
  });

  it("prices a facility's first tier at nothing, since every facility starts there", () => {
    for (const facility of catalog.facilities) {
      expect(valueForTier(facility.goldPerTier, 1)).toBe(0);
    }
  });

  it("names gold as the currency every change is paid in", () => {
    expect(GOLD_CURRENCY_ID).toMatch(UUID_V4);
  });
});

describe("estate rules", () => {
  it("reads a tier from its table, and a tier outside it as zero", () => {
    expect(valueForTier([0, 100, 400], 1)).toBe(0);
    expect(valueForTier([0, 100, 400], 2)).toBe(100);
    expect(valueForTier([0, 100, 400], 4)).toBe(0);
  });

  it("accepts only whole tiers from 1 to 15", () => {
    expect(isEstateTier(1)).toBe(true);
    expect(isEstateTier(15)).toBe(true);
    expect(isEstateTier(0)).toBe(false);
    expect(isEstateTier(16)).toBe(false);
    expect(isEstateTier(2.5)).toBe(false);
    expect(isEstateTier("3")).toBe(false);
  });

  it("concludes an expedition at the next midnight UTC", () => {
    expect(concludesAt(new Date("2026-11-03T10:30:00Z")).toISOString()).toBe(
      "2026-11-04T00:00:00.000Z",
    );
    expect(concludesAt(new Date("2026-11-03T23:59:59Z")).toISOString()).toBe(
      "2026-11-04T00:00:00.000Z",
    );
  });

  it("concludes an expedition sent exactly at midnight a full day later", () => {
    expect(concludesAt(new Date("2026-11-03T00:00:00Z")).toISOString()).toBe(
      "2026-11-04T00:00:00.000Z",
    );
  });

  it("holds a run as concluded from its end onward, and running before it", () => {
    const endsAt = new Date("2026-11-04T00:00:00Z");
    expect(hasConcluded(endsAt, new Date("2026-11-03T23:59:59Z"))).toBe(false);
    expect(hasConcluded(endsAt, endsAt)).toBe(true);
    expect(hasConcluded(endsAt, new Date("2026-11-05T12:00:00Z"))).toBe(true);
  });

  it("lets only admins and owners use the estate's debug tools", () => {
    expect(canUseEstateDebug("admin")).toBe(true);
    expect(canUseEstateDebug("owner")).toBe(true);
    expect(canUseEstateDebug("player")).toBe(false);
  });
});
