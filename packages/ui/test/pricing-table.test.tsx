import { describe, it, expect } from "vite-plus/test";
import { renderToString } from "@solidjs/web";
import { RLPricingTable } from "../src/components/pricing-table/RLPricingTable";
import { cleanHtml } from "./utils/normalize";

function render(fn: () => any): string {
  return cleanHtml(renderToString(fn));
}

describe("RLPricingTable", () => {
  it("renders children inside the root", () => {
    const html = render(() => <RLPricingTable>plans</RLPricingTable>);
    expect(html).toContain('data-slot="root"');
    expect(html).toContain("plans");
  });

  it("renders the root as the as prop element", () => {
    const html = render(() => <RLPricingTable as="section">plans</RLPricingTable>);
    expect(html.startsWith("<section")).toBe(true);
  });

  it("forwards extra attributes to the root", () => {
    const html = render(() => <RLPricingTable id="pricing-1">plans</RLPricingTable>);
    expect(html).toContain('id="pricing-1"');
  });
});
