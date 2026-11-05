import { describe, it, expect } from "vite-plus/test";
import { renderToString } from "@solidjs/web";
import { RLFieldset } from "../src/components/fieldset/RLFieldset";
import { cleanHtml } from "./utils/normalize";

function render(fn: () => any): string {
  return cleanHtml(renderToString(fn));
}

describe("RLFieldset", () => {
  it("renders children inside the root", () => {
    const html = render(() => <RLFieldset>inputs</RLFieldset>);
    expect(html).toContain('data-slot="root"');
    expect(html).toContain("inputs");
  });

  it("renders the root as the as prop element", () => {
    const html = render(() => <RLFieldset as="fieldset">inputs</RLFieldset>);
    expect(html.startsWith("<fieldset")).toBe(true);
  });

  it("forwards extra attributes to the root", () => {
    const html = render(() => <RLFieldset id="fieldset-1">inputs</RLFieldset>);
    expect(html).toContain('id="fieldset-1"');
  });
});
