import { describe, it, expect } from "vite-plus/test";

import { RLCopyMarkdown } from "../src/components/copy-markdown/RLCopyMarkdown";
import { renderSolid } from "./utils/normalize";

describe("RLCopyMarkdown", () => {
  it("renders a native button carrying the raw markdown", () => {
    const html = renderSolid(RLCopyMarkdown, { raw: "# Hello" });
    expect(html.startsWith("<button")).toBe(true);
    expect(html).toContain('data-raw="# Hello"');
  });

  it("renders children inside the button", () => {
    const html = renderSolid(RLCopyMarkdown, { raw: "x" }, "Copy page");
    expect(html).toMatch(/<button[^>]*>[\s\S]*Copy page[\s\S]*<\/button>/);
  });

  it("forwards disabled to the button", () => {
    const html = renderSolid(RLCopyMarkdown, { raw: "x", disabled: true });
    expect(html).toMatch(/<button[^>]*\sdisabled/);
  });

  it("forwards leadingSlot to the button leading position", () => {
    const html = renderSolid(RLCopyMarkdown, { raw: "x", leadingSlot: "LEAD" });
    expect(html).toContain("LEAD");
  });

  it("forwards extra attributes to the button", () => {
    const html = renderSolid(RLCopyMarkdown, { raw: "x", id: "copy-1" });
    expect(html).toMatch(/<button[^>]*id="copy-1"/);
  });
});
