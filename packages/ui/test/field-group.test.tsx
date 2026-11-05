import { describe, it, expect } from "vite-plus/test";

import { RLFieldGroup } from "../src/components/field-group/RLFieldGroup";
import { renderToString } from "@solidjs/web";
import { cleanHtml } from "./utils/normalize";

function render(fn: () => any): string {
  return cleanHtml(renderToString(fn));
}

function slotTag(html: string, slot: string): string {
  const match = html.match(new RegExp(`<[a-z0-9]+[^>]*data-slot="${slot}"[^>]*>`));
  return match?.[0] ?? "";
}

describe("RLFieldGroup", () => {
  describe("Default slot", () => {
    it("renders children inside the root", () => {
      const html = render(() => (
        <RLFieldGroup>
          <input data-testid="grouped" />
        </RLFieldGroup>
      ));

      expect(slotTag(html, "root")).not.toBe("");
      expect(html).toContain('data-testid="grouped"');
    });
  });

  describe("Leading and trailing slots", () => {
    it("omits the leading and trailing wrappers when no slots are given", () => {
      const html = render(() => <RLFieldGroup>x</RLFieldGroup>);

      expect(slotTag(html, "leading")).toBe("");
      expect(slotTag(html, "trailing")).toBe("");
    });

    it("renders leadingSlot before the children", () => {
      const html = render(() => (
        <RLFieldGroup leadingSlot={<span>https://</span>}>
          <input data-testid="field" />
        </RLFieldGroup>
      ));

      expect(slotTag(html, "leading")).not.toBe("");
      expect(html.indexOf("https://")).toBeLessThan(html.indexOf('data-testid="field"'));
    });

    it("renders trailingSlot after the children", () => {
      const html = render(() => (
        <RLFieldGroup trailingSlot={<span>.com</span>}>
          <input data-testid="field" />
        </RLFieldGroup>
      ));

      expect(slotTag(html, "trailing")).not.toBe("");
      expect(html.indexOf(".com")).toBeGreaterThan(html.indexOf('data-testid="field"'));
    });

    it("accepts a render function for leadingSlot", () => {
      const html = render(() => (
        <RLFieldGroup leadingSlot={() => <span>Rendered leading</span>}>x</RLFieldGroup>
      ));

      expect(html).toContain("Rendered leading");
    });

    it("accepts a render function for trailingSlot", () => {
      const html = render(() => (
        <RLFieldGroup trailingSlot={() => <span>Rendered trailing</span>}>x</RLFieldGroup>
      ));

      expect(html).toContain("Rendered trailing");
    });
  });
});
