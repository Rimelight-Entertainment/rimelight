import { describe, it, expect } from "vite-plus/test";

import { RLTooltip } from "../src/components/tooltip/RLTooltip";
import { renderSolid } from "./utils/normalize";

function contentOf(html: string): string {
  return html.match(/<div[^>]*data-slot="content"[^>]*>[\s\S]*<\/div>/)?.[0] ?? "";
}

describe("RLTooltip", () => {
  it("renders children inside the trigger", () => {
    const html = renderSolid(RLTooltip, { body: "Hint" }, "Hover me");
    expect(html).toMatch(/data-slot="trigger"[^>]*>Hover me</);
  });

  it("renders body text in the tooltip role", () => {
    const html = renderSolid(RLTooltip, { body: "Hint" }, "Hover me");
    expect(contentOf(html)).toContain('role="tooltip"');
    expect(contentOf(html)).toContain("Hint");
  });

  it("is closed by default", () => {
    const html = renderSolid(RLTooltip, { body: "Hint" }, "Hover me");
    expect(contentOf(html)).toContain('data-state="closed"');
  });

  it("opens when defaultOpen is set", () => {
    const html = renderSolid(RLTooltip, { body: "Hint", defaultOpen: true }, "Hover me");
    expect(contentOf(html)).toContain('data-state="open"');
  });

  it("follows the controlled open prop", () => {
    const html = renderSolid(RLTooltip, { body: "Hint", open: true }, "Hover me");
    expect(contentOf(html)).toContain('data-state="open"');
  });

  it("defaults placement to top", () => {
    const html = renderSolid(RLTooltip, { body: "Hint" }, "Hover me");
    expect(html).toMatch(/data-placement="top"/);
  });

  it("reflects the placement prop", () => {
    const html = renderSolid(RLTooltip, { body: "Hint", placement: "left" }, "Hover me");
    expect(html).toMatch(/data-placement="left"/);
  });

  it("replaces the body string with bodySlot", () => {
    const html = renderSolid(RLTooltip, { body: "Hint", bodySlot: "Rich body" }, "Hover me");
    expect(contentOf(html)).toContain("Rich body");
    expect(contentOf(html)).not.toContain("Hint");
  });

  it("forwards extra attributes to the root element", () => {
    const html = renderSolid(RLTooltip, { body: "Hint", id: "tip-1" }, "Hover me");
    expect(html).toMatch(/<div[^>]*data-slot="root"[^>]*id="tip-1"/);
  });
});
