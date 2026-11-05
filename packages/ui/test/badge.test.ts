import { describe, it, expect } from "vite-plus/test";

import { RLBadge } from "../src/components/badge/RLBadge";
import { renderSolid } from "./utils/normalize";

function count(html: string, pattern: RegExp): number {
  return html.match(pattern)?.length ?? 0;
}

describe("RLBadge", () => {
  describe("Label and children", () => {
    it("renders the label inside the label slot", () => {
      const html = renderSolid(RLBadge, { label: "New" });
      expect(html).toContain('data-slot="label"');
      expect(html).toContain("New");
    });

    it("renders numeric zero labels", () => {
      const html = renderSolid(RLBadge, { label: 0 });
      expect(html).toContain('data-slot="label"');
      expect(html).toContain(">0<");
    });

    it("renders no label slot when no label is given", () => {
      const html = renderSolid(RLBadge, {});
      expect(html).not.toContain('data-slot="label"');
    });

    it("renders children in place of the label", () => {
      const html = renderSolid(RLBadge, { label: "Ignored" }, "Child");
      expect(html).toContain("Child");
      expect(html).not.toContain("Ignored");
    });

    it("renders the root as the provided polymorphic tag", () => {
      const html = renderSolid(RLBadge, { as: "div", label: "x" });
      expect(html.startsWith("<div")).toBe(true);
    });
  });

  describe("Icons", () => {
    it("shows icon on the leading side by default", () => {
      const html = renderSolid(RLBadge, { icon: "rocket", label: "x" });
      expect(html).toContain('data-slot="leading-icon"');
      expect(html).not.toContain('data-slot="trailing-icon"');
    });

    it("shows icon on the trailing side when trailing is set", () => {
      const html = renderSolid(RLBadge, { icon: "rocket", trailing: true, label: "x" });
      expect(html).toContain('data-slot="trailing-icon"');
      expect(html).not.toContain('data-slot="leading-icon"');
    });

    it("renders leadingIcon and trailingIcon independently", () => {
      const html = renderSolid(RLBadge, { leadingIcon: "star", trailingIcon: "check" });
      expect(html).toContain('data-slot="leading-icon"');
      expect(html).toContain('data-slot="trailing-icon"');
    });

    it("prefers leadingIcon over icon on the leading side", () => {
      const html = renderSolid(RLBadge, { icon: "rocket", leadingIcon: "star" });
      expect(count(html, /data-slot="leading-icon"/g)).toBe(1);
    });

    it("renders no icon slots when no icon is given", () => {
      const html = renderSolid(RLBadge, { label: "x" });
      expect(html).not.toContain('data-slot="leading-icon"');
      expect(html).not.toContain('data-slot="trailing-icon"');
    });
  });

  describe("Avatar", () => {
    it("renders a string avatar as the leading avatar", () => {
      const html = renderSolid(RLBadge, { avatar: "https://example.com/a.png" });
      expect(html).toContain('data-slot="leading-avatar"');
    });

    it("renders an object avatar as the leading avatar", () => {
      const html = renderSolid(RLBadge, { avatar: { src: "/a.png", alt: "Ada" } });
      expect(html).toContain('data-slot="leading-avatar"');
    });
  });

  describe("Custom slots", () => {
    it("wraps leadingSlot content in the leading-slot element", () => {
      const html = renderSolid(RLBadge, { leadingSlot: "LEAD" });
      expect(html).toContain('data-slot="leading-slot"');
      expect(html).toContain("LEAD");
    });

    it("leadingSlot replaces the leading icon and avatar", () => {
      const html = renderSolid(RLBadge, {
        leadingSlot: "LEAD",
        leadingIcon: "star",
        avatar: "/a.png",
      });
      expect(html).not.toContain('data-slot="leading-icon"');
      expect(html).not.toContain('data-slot="leading-avatar"');
    });

    it("wraps trailingSlot content in the trailing-slot element", () => {
      const html = renderSolid(RLBadge, { trailingSlot: "TRAIL" });
      expect(html).toContain('data-slot="trailing-slot"');
      expect(html).toContain("TRAIL");
    });

    it("trailingSlot replaces the trailing icon", () => {
      const html = renderSolid(RLBadge, { trailingSlot: "TRAIL", trailingIcon: "check" });
      expect(html).not.toContain('data-slot="trailing-icon"');
    });

    it("renders slot render functions", () => {
      const html = renderSolid(RLBadge, { leadingSlot: () => "FN" });
      expect(html).toContain("FN");
    });
  });

  describe("Shape", () => {
    it("renders the root with the square, rounded and pill shape values", () => {
      const square = renderSolid(RLBadge, { shape: "square", label: "x" });
      const pill = renderSolid(RLBadge, { shape: "pill", label: "x" });
      expect(square).toContain('data-slot="root"');
      expect(pill).toContain('data-slot="root"');
    });
  });
});
