import { describe, expect, it } from "vite-plus/test";
import { canAdjustCurrency, clampBalance, currencyCapsFor } from "../src/api/title-currencies";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

describe("clampBalance", () => {
  it("keeps a balance inside zero and the cap", () => {
    expect(clampBalance(50, 100)).toBe(50);
    expect(clampBalance(150, 100)).toBe(100);
    expect(clampBalance(-5, 100)).toBe(0);
  });
});

describe("canAdjustCurrency", () => {
  it("allows admins and owners only", () => {
    expect(canAdjustCurrency("admin")).toBe(true);
    expect(canAdjustCurrency("owner")).toBe(true);
    expect(canAdjustCurrency("user")).toBe(false);
    expect(canAdjustCurrency("employee")).toBe(false);
  });
});

describe("currencyCapsFor", () => {
  it("lists the Grand Tale currencies with positive caps, keyed by UUIDv4", () => {
    const caps = currencyCapsFor("grand-tale");
    expect(Object.keys(caps)).toHaveLength(6);
    for (const [id, cap] of Object.entries(caps)) {
      expect(id).toMatch(UUID);
      expect(cap).toBeGreaterThan(0);
    }
  });
});
