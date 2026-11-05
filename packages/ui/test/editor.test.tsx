import { describe, it, expect } from "vite-plus/test";
import { renderToString } from "@solidjs/web";
import { RLEditor } from "../src/components/editor/RLEditor";
import { cleanHtml } from "./utils/normalize";

function render(fn: () => any): string {
  return cleanHtml(renderToString(fn));
}

describe("RLEditor", () => {
  it("renders children inside the root", () => {
    const html = render(() => <RLEditor>draft</RLEditor>);
    expect(html).toContain('data-slot="root"');
    expect(html).toContain("draft");
  });

  it("renders the root as the as prop element", () => {
    const html = render(() => <RLEditor as="article">draft</RLEditor>);
    expect(html.startsWith("<article")).toBe(true);
  });

  it("forwards extra attributes to the root", () => {
    const html = render(() => <RLEditor id="editor-1">draft</RLEditor>);
    expect(html).toContain('id="editor-1"');
  });
});
