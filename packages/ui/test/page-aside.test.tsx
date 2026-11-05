import { describe, it, expect } from "vite-plus/test";
import { renderToString } from "@solidjs/web";
import { RLPageAside } from "../src/components/page-aside/RLPageAside";
import { cleanHtml } from "./utils/normalize";

function render(fn: () => any): string {
  return cleanHtml(renderToString(fn));
}

describe("RLPageAside", () => {
  it("renders children inside the root", () => {
    const html = render(() => <RLPageAside>links</RLPageAside>);
    expect(html).toContain('data-slot="root"');
    expect(html).toContain("links");
  });

  it("renders the root as the as prop element", () => {
    const html = render(() => <RLPageAside as="aside">links</RLPageAside>);
    expect(html.startsWith("<aside")).toBe(true);
  });

  it("forwards extra attributes to the root", () => {
    const html = render(() => <RLPageAside id="aside-1">links</RLPageAside>);
    expect(html).toContain('id="aside-1"');
  });
});
