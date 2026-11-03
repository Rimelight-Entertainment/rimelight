import { describe, expect, it } from "vite-plus/test";
import { ESTATE_MAX_TIER, hasConcluded, isEstateTier } from "../src/api/title-estate";

describe("estate tiers", () => {
  it("accepts only whole tiers from 1 to 15", () => {
    expect(isEstateTier(1)).toBe(true);
    expect(isEstateTier(ESTATE_MAX_TIER)).toBe(true);
    expect(isEstateTier(0)).toBe(false);
    expect(isEstateTier(16)).toBe(false);
    expect(isEstateTier(2.5)).toBe(false);
    expect(isEstateTier("3")).toBe(false);
  });
});

describe("estate runs", () => {
  it("holds a run as concluded from its end onward, and running before it", () => {
    const endsAt = new Date("2026-11-04T00:00:00Z");
    expect(hasConcluded(endsAt, new Date("2026-11-03T23:59:59Z"))).toBe(false);
    expect(hasConcluded(endsAt, endsAt)).toBe(true);
    expect(hasConcluded(endsAt, new Date("2026-11-05T12:00:00Z"))).toBe(true);
  });
});
