import { describe, it, expect } from "vite-plus/test";
import { renderToString } from "@solidjs/web";
import { RLPricingPlan } from "../src/components/pricing-plan/RLPricingPlan";
import { cleanHtml } from "./utils/normalize";

function render(fn: () => any): string {
  return cleanHtml(renderToString(fn));
}

describe("RLPricingPlan", () => {
  it("renders children inside the root", () => {
    const html = render(() => <RLPricingPlan>pro</RLPricingPlan>);
    expect(html).toContain('data-slot="root"');
    expect(html).toContain("pro");
  });

  it("renders the root as the as prop element", () => {
    const html = render(() => <RLPricingPlan as="li">pro</RLPricingPlan>);
    expect(html.startsWith("<li")).toBe(true);
  });

  it("forwards extra attributes to the root", () => {
    const html = render(() => <RLPricingPlan id="plan-1">pro</RLPricingPlan>);
    expect(html).toContain('id="plan-1"');
  });
});
