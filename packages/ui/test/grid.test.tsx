import { describe, it, expect } from "vite-plus/test";
import { renderToString } from "@solidjs/web";
import { RLGrid } from "../src/components/grid/RLGrid";
import { cleanHtml } from "./utils/normalize";

function render(fn: () => any): string {
  return cleanHtml(renderToString(fn));
}

describe("RLGrid", () => {
  it("renders children inside the root", () => {
    const html = render(() => (
      <RLGrid>
        <span>one</span>
        <span>two</span>
      </RLGrid>
    ));
    expect(html).toContain('data-slot="root"');
    expect(html).toContain("one");
    expect(html).toContain("two");
  });

  it("renders the root as the as prop element", () => {
    const html = render(() => <RLGrid as="ul">item</RLGrid>);
    expect(html.startsWith("<ul")).toBe(true);
  });

  it("forwards extra attributes to the root", () => {
    const html = render(() => <RLGrid id="grid-1">item</RLGrid>);
    expect(html).toContain('id="grid-1"');
  });
});
