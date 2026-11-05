import { describe, it, expect } from "vite-plus/test";

import { RLMain } from "../src/components/main/RLMain";
import { renderSolid } from "./utils/normalize";

describe("RLMain", () => {
  it("renders a main landmark by default", () => {
    const html = renderSolid(RLMain, {}, "content");
    expect(html.startsWith("<main")).toBe(true);
  });

  it("renders its children", () => {
    const html = renderSolid(RLMain, {}, () => <p>page body</p>);
    expect(html).toContain("<p>page body</p>");
  });

  it("generates an id when none is provided", () => {
    const html = renderSolid(RLMain, {}, "content");
    expect(html).toMatch(/id="[^"]+"/);
  });

  it("uses a caller-provided id", () => {
    const html = renderSolid(RLMain, { id: "audit-main" }, "content");
    expect(html).toContain('id="audit-main"');
  });

  it("renders the requested element through as", () => {
    const html = renderSolid(RLMain, { as: "div" }, "content");
    expect(html.startsWith("<div")).toBe(true);
  });

  it("forwards accessibility attributes to the root", () => {
    const html = renderSolid(
      RLMain,
      { role: "region", "aria-label": "Application main" },
      "content",
    );
    expect(html).toContain('role="region"');
    expect(html).toContain('aria-label="Application main"');
  });
});
