import { describe, expect, it } from "vite-plus/test";
import { verifyTranslations } from "../src/lint";

describe("translation audit with inherited Object member names", () => {
  it("reports a target key named like an inherited member as stale, not present", () => {
    const report = verifyTranslations({ en: { a: "x" }, fr: { a: "y", constructor: "z" } });
    expect(report.staleKeys["fr"]).toEqual(["constructor"]);
  });

  it("reports a base key named like an inherited member as missing, not present", () => {
    const report = verifyTranslations({ en: { a: "x", toString: "t" }, fr: { a: "y" } });
    expect(report.missingKeys["fr"]).toEqual(["toString"]);
  });
});
