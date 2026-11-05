import { describe, it, expect } from "vite-plus/test";
import { renderToString } from "@solidjs/web";
import { RLProse } from "../src/components/prose/RLProse";
import { cleanHtml } from "./utils/normalize";

function render(fn: () => any): string {
  return cleanHtml(renderToString(fn));
}

describe("RLProse", () => {
  it("renders children inside the root", () => {
    const html = render(() => <RLProse>article body</RLProse>);
    expect(html).toContain('data-slot="root"');
    expect(html).toContain("article body");
  });

  it("renders the root as the as prop element", () => {
    const html = render(() => <RLProse as="article">body</RLProse>);
    expect(html.startsWith("<article")).toBe(true);
  });

  it("forwards extra attributes to the root", () => {
    const html = render(() => <RLProse id="prose-1">body</RLProse>);
    expect(html).toContain('id="prose-1"');
  });
});
