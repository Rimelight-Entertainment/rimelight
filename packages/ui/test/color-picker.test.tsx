import { describe, it, expect } from "vite-plus/test";
import { renderToString } from "@solidjs/web";

import { RLColorPicker } from "../src/components/color-picker/RLColorPicker";
import { cleanHtml } from "./utils/normalize";

function render(fn: () => any): string {
  return cleanHtml(renderToString(fn));
}

function rootTag(html: string): string {
  return html.match(/<[a-z0-9]+[^>]*data-slot="root"[^>]*>/)?.[0] ?? "";
}

function attr(tag: string, name: string): string | undefined {
  const match = tag.match(new RegExp(`\\s${name}(?:="([^"]*)")?(?=[\\s>])`));
  return match ? (match[1] ?? "") : undefined;
}

describe("RLColorPicker", () => {
  describe("Exports", () => {
    it("exports RLColorPicker component", () => {
      expect(RLColorPicker).toBeDefined();
    });
  });

  describe("Structure & Props", () => {
    it("renders a labelled group with the default label", () => {
      const tag = rootTag(render(() => <RLColorPicker />));
      expect(attr(tag, "role")).toBe("group");
      expect(attr(tag, "aria-label")).toBeTruthy();
    });

    it("uses a custom aria-label when provided", () => {
      const tag = rootTag(render(() => <RLColorPicker aria-label="Brand color" />));
      expect(attr(tag, "aria-label")).toBe("Brand color");
    });

    it("flags the root with data-disabled when disabled", () => {
      const tag = rootTag(render(() => <RLColorPicker disabled />));
      expect(attr(tag, "data-disabled")).toBe("");
    });

    it("omits data-disabled when enabled", () => {
      const tag = rootTag(render(() => <RLColorPicker />));
      expect(attr(tag, "data-disabled")).toBeUndefined();
    });

    it("does not leak value props onto the DOM", () => {
      const html = render(() => <RLColorPicker value="#00ff00" defaultValue="#0000ff" />);
      expect(html).not.toContain("defaultValue");
    });
  });
});
