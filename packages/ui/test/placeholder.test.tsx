import { describe, it, expect } from "vite-plus/test";
import { renderToString } from "@solidjs/web";
import { RLPlaceholder } from "../src/components/placeholder/RLPlaceholder";
import { cleanHtml } from "./utils/normalize";

function render(fn: () => any): string {
  return cleanHtml(renderToString(fn));
}

describe("RLPlaceholder", () => {
  it("renders children inside the root", () => {
    const html = render(() => <RLPlaceholder>empty</RLPlaceholder>);
    expect(html).toContain('data-slot="root"');
    expect(html).toContain("empty");
  });

  it("renders the root as the as prop element", () => {
    const html = render(() => <RLPlaceholder as="figure">empty</RLPlaceholder>);
    expect(html.startsWith("<figure")).toBe(true);
  });

  it("gives each instance its own pattern id referenced by its fill", () => {
    const html = render(() => (
      <>
        <RLPlaceholder>a</RLPlaceholder>
        <RLPlaceholder>b</RLPlaceholder>
      </>
    ));
    const ids = [...html.matchAll(/<pattern[^>]*\sid="([^"]+)"/g)].map((m) => m[1]);
    expect(ids).toHaveLength(2);
    expect(new Set(ids).size).toBe(2);
    for (const id of ids) {
      expect(html).toContain(`fill="url(#${id})"`);
    }
  });
});
