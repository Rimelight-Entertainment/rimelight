import { describe, expect, it } from "vite-plus/test";
import {
  ESTATE_MAX_TIER,
  canStartResearch,
  evaluateGate,
  hasConcluded,
  isEstateTier,
  type GateCondition,
  type GateState,
} from "../src/api/title-estate";

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

describe("research slots", () => {
  it("allows five researches at once and no more", () => {
    expect(canStartResearch(0)).toBe(true);
    expect(canStartResearch(4)).toBe(true);
    expect(canStartResearch(5)).toBe(false);
  });
});

describe("gate conditions", () => {
  const facility = "11111111-1111-4111-8111-111111111111";
  const research = "22222222-2222-4222-8222-222222222222";
  const gold = "33333333-3333-4333-8333-333333333333";
  const unknownCurrency = "44444444-4444-4444-8444-444444444444";

  const state: GateState = {
    facilityTiers: new Map([[facility, 4]]),
    completedResearch: new Set([research]),
    balances: new Map([[gold, 100]]),
  };

  const tier = (value: number): GateCondition => ({
    kind: "facilityTier",
    subject: facility,
    tag: null,
    value,
  });
  const completed: GateCondition = {
    kind: "hasCompletedResearch",
    subject: research,
    tag: null,
    value: 0,
  };
  const balance = (value: number, currency = gold): GateCondition => ({
    kind: "balance",
    subject: currency,
    tag: null,
    value,
  });

  it("passes an empty list", () => {
    expect(evaluateGate([], state)).toEqual({ passed: true });
  });

  it("passes a facility tier on the boundary and fails one above it", () => {
    expect(evaluateGate([tier(4)], state)).toEqual({ passed: true });
    expect(evaluateGate([tier(5)], state)).toEqual({
      passed: false,
      index: 0,
      kind: "facilityTier",
      reason: "below-tier",
    });
  });

  it("treats a facility with no row as tier 1", () => {
    const unbuilt: GateCondition = { kind: "facilityTier", subject: research, tag: null, value: 1 };
    expect(evaluateGate([unbuilt], state)).toEqual({ passed: true });
    expect(evaluateGate([{ ...unbuilt, value: 2 }], state)).toEqual({
      passed: false,
      index: 0,
      kind: "facilityTier",
      reason: "below-tier",
    });
  });

  it("passes a completed research and fails one not yet completed", () => {
    expect(evaluateGate([completed], state)).toEqual({ passed: true });
    expect(evaluateGate([{ ...completed, subject: facility }], state)).toEqual({
      passed: false,
      index: 0,
      kind: "hasCompletedResearch",
      reason: "not-completed",
    });
  });

  it("passes a balance on the boundary and fails one above it", () => {
    expect(evaluateGate([balance(100)], state)).toEqual({ passed: true });
    expect(evaluateGate([balance(101)], state)).toEqual({
      passed: false,
      index: 0,
      kind: "balance",
      reason: "below-balance",
    });
  });

  it("refuses a balance on a currency the title does not cap", () => {
    expect(evaluateGate([balance(0, unknownCurrency)], state)).toEqual({
      passed: false,
      index: 0,
      kind: "balance",
      reason: "unknown-currency",
    });
  });

  it("refuses level and hasTag, which the web API cannot check", () => {
    const level: GateCondition = { kind: "level", subject: facility, tag: null, value: 1 };
    const hasTag: GateCondition = { kind: "hasTag", subject: null, tag: "Estate.Ready", value: 0 };
    expect(evaluateGate([level], state)).toEqual({
      passed: false,
      index: 0,
      kind: "level",
      reason: "unsupported",
    });
    expect(evaluateGate([hasTag], state)).toEqual({
      passed: false,
      index: 0,
      kind: "hasTag",
      reason: "unsupported",
    });
  });

  it("returns the first failing condition in order", () => {
    expect(evaluateGate([tier(1), balance(999), tier(9)], state)).toEqual({
      passed: false,
      index: 1,
      kind: "balance",
      reason: "below-balance",
    });
  });
});
