import { describe, expect, it } from "vite-plus/test";
import { canAdjustCurrency, clampBalance, currencyCapsFor } from "../src/api/title-currencies";

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
  it("lists the Grand Tale currencies with positive caps", () => {
    const caps = currencyCapsFor("grand-tale");
    expect(caps["Currency.Gold"]).toBeGreaterThan(0);
    expect(caps["Currency.Sparks"]).toBeGreaterThan(0);
  });
});
