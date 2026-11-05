import { describe, it, expect } from "vite-plus/test";

import { RLShare } from "../src/components/share/RLShare";
import { renderSolid } from "./utils/normalize";

describe("RLShare", () => {
  it("renders a native button as the root", () => {
    const html = renderSolid(RLShare, {});
    expect(html.startsWith("<button")).toBe(true);
    expect(html).toMatch(/<button[^>]*data-slot="root"/);
  });

  it("sets data-theme from the theme prop", () => {
    const html = renderSolid(RLShare, { theme: "dark" });
    expect(html).toMatch(/<button[^>]*data-slot="root"[^>]*data-theme="dark"/);
  });

  it("renders children inside the button", () => {
    const html = renderSolid(RLShare, {}, "Send");
    expect(html).toMatch(/<button[^>]*>[\s\S]*Send[\s\S]*<\/button>/);
  });

  it("forwards disabled to the button", () => {
    const html = renderSolid(RLShare, { disabled: true });
    expect(html).toMatch(/<button[^>]*\sdisabled/);
  });

  it("forwards extra attributes to the button", () => {
    const html = renderSolid(RLShare, { id: "share-1" });
    expect(html).toMatch(/<button[^>]*id="share-1"/);
  });
});
