import { describe, it, expect } from "vite-plus/test";
import { renderToString } from "@solidjs/web";
import { RLKnob } from "../src/components/knob/RLKnob";
import { cleanHtml } from "./utils/normalize";

function render(fn: () => any): string {
  return cleanHtml(renderToString(fn));
}

describe("RLKnob", () => {
  it("renders children inside the root", () => {
    const html = render(() => <RLKnob>dial</RLKnob>);
    expect(html).toContain('data-slot="root"');
    expect(html).toContain("dial");
  });

  it("renders the root as the as prop element", () => {
    const html = render(() => <RLKnob as="figure">dial</RLKnob>);
    expect(html.startsWith("<figure")).toBe(true);
  });

  it("forwards extra attributes to the root", () => {
    const html = render(() => <RLKnob id="knob-1">dial</RLKnob>);
    expect(html).toContain('id="knob-1"');
  });
});
