import { describe, it, expect } from "vite-plus/test";
import { renderToString } from "@solidjs/web";
import { RLPhoneMockup } from "../src/components/phone-mockup/RLPhoneMockup";
import { cleanHtml } from "./utils/normalize";

function render(fn: () => any): string {
  return cleanHtml(renderToString(fn));
}

describe("RLPhoneMockup", () => {
  it("renders children inside the root", () => {
    const html = render(() => <RLPhoneMockup>screen</RLPhoneMockup>);
    expect(html).toContain('data-slot="root"');
    expect(html).toContain("screen");
  });

  it("renders the root as the as prop element", () => {
    const html = render(() => <RLPhoneMockup as="figure">screen</RLPhoneMockup>);
    expect(html.startsWith("<figure")).toBe(true);
  });

  it("forwards extra attributes to the root", () => {
    const html = render(() => <RLPhoneMockup id="phone-1">screen</RLPhoneMockup>);
    expect(html).toContain('id="phone-1"');
  });
});
