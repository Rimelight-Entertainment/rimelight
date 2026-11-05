import { describe, it, expect } from "vite-plus/test";
import { renderToString } from "@solidjs/web";
import { RLPageHeader } from "../src/components/page-header/RLPageHeader";
import { cleanHtml } from "./utils/normalize";

function render(fn: () => any): string {
  return cleanHtml(renderToString(fn));
}

describe("RLPageHeader", () => {
  it("renders children inside the root", () => {
    const html = render(() => <RLPageHeader>title</RLPageHeader>);
    expect(html).toContain('data-slot="root"');
    expect(html).toContain("title");
  });

  it("renders the root as the as prop element", () => {
    const html = render(() => <RLPageHeader as="header">title</RLPageHeader>);
    expect(html.startsWith("<header")).toBe(true);
  });

  it("forwards extra attributes to the root", () => {
    const html = render(() => <RLPageHeader id="header-1">title</RLPageHeader>);
    expect(html).toContain('id="header-1"');
  });
});
