import { describe, it, expect } from "vite-plus/test";
import { renderToString } from "@solidjs/web";
import { RLMeter } from "../src/components/meter/RLMeter";
import { cleanHtml } from "./utils/normalize";

function render(fn: () => any): string {
  return cleanHtml(renderToString(fn));
}

describe("RLMeter", () => {
  it("renders children inside the root", () => {
    const html = render(() => <RLMeter>72%</RLMeter>);
    expect(html).toContain('data-slot="root"');
    expect(html).toContain("72%");
  });

  it("renders the root as the as prop element", () => {
    const html = render(() => <RLMeter as="span">72%</RLMeter>);
    expect(html.startsWith("<span")).toBe(true);
  });

  it("forwards extra attributes to the root", () => {
    const html = render(() => <RLMeter id="meter-1">72%</RLMeter>);
    expect(html).toContain('id="meter-1"');
  });
});
