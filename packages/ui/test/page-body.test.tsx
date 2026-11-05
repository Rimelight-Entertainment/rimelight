import { describe, it, expect } from "vite-plus/test";
import { renderToString } from "@solidjs/web";
import { RLPageBody } from "../src/components/page-body/RLPageBody";
import { cleanHtml } from "./utils/normalize";

function render(fn: () => any): string {
  return cleanHtml(renderToString(fn));
}

describe("RLPageBody", () => {
  it("renders children inside the root", () => {
    const html = render(() => <RLPageBody>content</RLPageBody>);
    expect(html).toContain('data-slot="root"');
    expect(html).toContain("content");
  });

  it("renders the root as the as prop element", () => {
    const html = render(() => <RLPageBody as="main">content</RLPageBody>);
    expect(html.startsWith("<main")).toBe(true);
  });

  it("forwards extra attributes to the root", () => {
    const html = render(() => <RLPageBody id="body-1">content</RLPageBody>);
    expect(html).toContain('id="body-1"');
  });
});
