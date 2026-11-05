import { describe, it, expect } from "vite-plus/test";

import { RLChip } from "../src/components/chip/RLChip";
import { renderSolid } from "./utils/normalize";

describe("RLChip", () => {
  describe("Structure & Polymorphism", () => {
    it("renders root and base wrapping children", () => {
      const html = renderSolid(RLChip, {}, <button type="button">Action</button>);
      expect(html).toContain('data-slot="root"');
      expect(html).toContain('data-slot="base"');
      expect(html).toContain("Action");
    });

    it("renders the root as the element given by the as prop", () => {
      const span = renderSolid(RLChip, { as: "span" }, <span>Child</span>);
      expect(span).toMatch(/^<span/);

      const section = renderSolid(RLChip, { as: "section" }, <div>Section Content</div>);
      expect(section).toMatch(/^<section/);
    });

    it("forwards id, aria attributes, and data attributes to the root", () => {
      const html = renderSolid(
        RLChip,
        { id: "user-status-chip", "aria-label": "Online status", "data-testid": "chip-root" },
        <span>User Avatar</span>,
      );
      expect(html).toContain('id="user-status-chip"');
      expect(html).toContain('aria-label="Online status"');
      expect(html).toContain('data-testid="chip-root"');
    });

    it("attaches data-theme when provided", () => {
      const html = renderSolid(RLChip, { theme: "dark" }, <span>Target</span>);
      expect(html).toContain('data-theme="dark"');
    });
  });

  describe("Visibility (show prop)", () => {
    it("renders the chip indicator when show is undefined", () => {
      const html = renderSolid(RLChip, { text: "3" }, <span>Target</span>);
      expect(html).toContain('data-slot="base"');
      expect(html).toContain("3");
    });

    it("hides the chip indicator when show is false while preserving children", () => {
      const html = renderSolid(RLChip, { show: false }, <span>Wrapped Child</span>);
      expect(html).toContain('data-slot="root"');
      expect(html).not.toContain('data-slot="base"');
      expect(html).toContain("Wrapped Child");
    });

    it("hides a standalone indicator when show is false", () => {
      const html = renderSolid(RLChip, { standalone: true, show: false });
      expect(html).not.toContain('data-slot="base"');
    });
  });

  describe("Text & Label Slot", () => {
    it("renders string text inside the label", () => {
      const html = renderSolid(RLChip, { text: "99+" }, <span>Target</span>);
      expect(html).toContain('data-slot="label"');
      expect(html).toContain("99+");
    });

    it("renders numeric text inside the label", () => {
      const html = renderSolid(RLChip, { text: 7 }, <span>Target</span>);
      expect(html).toContain("7");
    });

    it("renders the label slot element instead of text", () => {
      const html = renderSolid(
        RLChip,
        { text: "Ignored", labelSlot: <strong class="vip-badge">VIP</strong> },
        <span>Target</span>,
      );
      expect(html).toContain("VIP");
      expect(html).toContain("vip-badge");
      expect(html).not.toContain("Ignored");
    });

    it("invokes a render-function label slot", () => {
      const html = renderSolid(
        RLChip,
        { labelSlot: () => <strong>Rendered</strong> },
        <span>Target</span>,
      );
      expect(html).toContain("Rendered");
    });
  });

  describe("Custom UI & Classes", () => {
    it("merges the class prop onto the root", () => {
      const html = renderSolid(RLChip, { class: "custom-chip-root" }, <span>Target</span>);
      expect(html).toContain("custom-chip-root");
    });

    it("applies ui overrides to root and base", () => {
      const html = renderSolid(
        RLChip,
        { ui: { root: "custom-ui-root", base: "custom-ui-base" } },
        <span>Target</span>,
      );
      expect(html).toContain("custom-ui-root");
      expect(html).toContain("custom-ui-base");
    });
  });
});
