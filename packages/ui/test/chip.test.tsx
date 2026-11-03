import { describe, it, expect } from "vite-plus/test";

import { RLChip } from "../src/components/chip/RLChip";
import { renderToString } from "@solidjs/web";
import { cleanHtml } from "./utils/normalize";

function render(fn: () => any): string {
  return cleanHtml(renderToString(fn));
}

function slotTag(html: string, slot: string): string {
  const match = html.match(new RegExp(`<[a-z0-9]+[^>]*data-slot="${slot}"[^>]*>`));
  return match?.[0] ?? "";
}

function attr(tag: string, name: string): string | undefined {
  return tag.match(new RegExp(`\\s${name}="([^"]*)"`))?.[1];
}

describe("RLChip", () => {
  const sizes = ["3xs", "2xs", "xs", "sm", "md", "lg", "xl", "2xl", "3xl"] as const;
  const colors = [
    "primary",
    "secondary",
    "success",
    "info",
    "warning",
    "error",
    "neutral",
  ] as const;
  const positions = ["top-right", "bottom-right", "top-left", "bottom-left"] as const;

  describe("Exports", () => {
    it("exports RLChip component from package index", () => {
      expect(RLChip).toBeDefined();
    });
  });

  describe("Structure & Polymorphism", () => {
    it("renders default structure with root and base slots wrapping children", () => {
      const html = render(() => (
        <RLChip>
          <button type="button">Action</button>
        </RLChip>
      ));
      expect(html).toMatch(/^<div/);
      expect(slotTag(html, "root")).not.toBe("");
      expect(slotTag(html, "base")).not.toBe("");
      expect(html).toContain("Action");
    });

    it("renders polymorphic element via as prop", () => {
      const spanHtml = render(() => (
        <RLChip as="span">
          <span>Child</span>
        </RLChip>
      ));
      expect(spanHtml).toMatch(/^<span/);

      const sectionHtml = render(() => (
        <RLChip as="section">
          <div>Section Content</div>
        </RLChip>
      ));
      expect(sectionHtml).toMatch(/^<section/);
    });

    it("forwards attributes, id, and aria labels to the root element", () => {
      const html = render(() => (
        <RLChip id="user-status-chip" aria-label="Online status" data-testid="chip-root">
          <span>User Avatar</span>
        </RLChip>
      ));
      const root = slotTag(html, "root");
      expect(attr(root, "id")).toBe("user-status-chip");
      expect(attr(root, "aria-label")).toBe("Online status");
      expect(attr(root, "data-testid")).toBe("chip-root");
    });
  });

  describe("Sizes", () => {
    for (const size of sizes) {
      it(`renders size=${size} correctly`, () => {
        const html = render(() => (
          <RLChip size={size} text="1">
            <span>Target</span>
          </RLChip>
        ));
        expect(slotTag(html, "root")).not.toBe("");
        expect(slotTag(html, "base")).not.toBe("");
        expect(html).toContain("1");
      });
    }
  });

  describe("Colors", () => {
    for (const color of colors) {
      it(`renders semantic color=${color} correctly`, () => {
        const html = render(() => (
          <RLChip color={color}>
            <span>Target</span>
          </RLChip>
        ));
        const root = slotTag(html, "root");
        expect(root).toContain(`rl-color-${color}`);
      });
    }

    it("applies neutral compound variant with bg-inverted text-default", () => {
      const html = render(() => (
        <RLChip color="neutral">
          <span>Target</span>
        </RLChip>
      ));
      const base = slotTag(html, "base");
      expect(base).toContain("bg-inverted text-default");
    });

    it("supports custom theme colors via rl-color class", () => {
      const html = render(() => (
        <RLChip color="brand-accent">
          <span>Target</span>
        </RLChip>
      ));
      expect(slotTag(html, "root")).toContain("rl-color-brand-accent");
    });
  });

  describe("Positions & Inset", () => {
    for (const pos of positions) {
      it(`renders position=${pos} with default offset transform when inset=false`, () => {
        const html = render(() => (
          <RLChip position={pos} inset={false}>
            <span>Target</span>
          </RLChip>
        ));
        const base = slotTag(html, "base");
        expect(base).toContain("transform");
      });

      it(`renders position=${pos} without offset transform when inset=true`, () => {
        const html = render(() => (
          <RLChip position={pos} inset={true}>
            <span>Target</span>
          </RLChip>
        ));
        const base = slotTag(html, "base");
        expect(base).not.toContain("transform");
      });
    }
  });

  describe("Standalone Mode", () => {
    it("renders standalone chip without absolute positioning class", () => {
      const html = render(() => <RLChip standalone inset />);
      const base = slotTag(html, "base");
      expect(base).not.toContain("absolute");
    });

    it("renders standalone chip with text", () => {
      const html = render(() => <RLChip standalone text={42} />);
      expect(html).toContain("42");
      expect(slotTag(html, "base")).not.toBe("");
    });
  });

  describe("Visibility (show prop)", () => {
    it("renders chip indicator when show is true or undefined", () => {
      const defaultHtml = render(() => (
        <RLChip>
          <span>Target</span>
        </RLChip>
      ));
      expect(slotTag(defaultHtml, "base")).not.toBe("");

      const trueHtml = render(() => (
        <RLChip show={true}>
          <span>Target</span>
        </RLChip>
      ));
      expect(slotTag(trueHtml, "base")).not.toBe("");
    });

    it("hides chip indicator when show is false while preserving children", () => {
      const html = render(() => (
        <RLChip show={false}>
          <span>Wrapped Child</span>
        </RLChip>
      ));
      expect(slotTag(html, "root")).not.toBe("");
      expect(slotTag(html, "base")).toBe("");
      expect(html).toContain("Wrapped Child");
    });

    it("hides indicator on standalone chip when show is false", () => {
      const html = render(() => <RLChip standalone show={false} />);
      expect(slotTag(html, "base")).toBe("");
    });
  });

  describe("Text & Content Slots", () => {
    it("renders string text inside chip", () => {
      const html = render(() => (
        <RLChip text="99+">
          <span>Target</span>
        </RLChip>
      ));
      expect(html).toContain("99+");
    });

    it("renders numeric text inside chip", () => {
      const html = render(() => (
        <RLChip text={7}>
          <span>Target</span>
        </RLChip>
      ));
      expect(html).toContain("7");
    });

    it("renders custom content slot and overrides text prop", () => {
      const html = render(() => (
        <RLChip text="Ignored" content={<strong class="vip-badge">VIP</strong>}>
          <span>Target</span>
        </RLChip>
      ));
      expect(html).toContain("VIP");
      expect(html).toContain("vip-badge");
      expect(html).not.toContain("Ignored");
    });

    it("supports contentSlot alias for content prop", () => {
      const html = render(() => (
        <RLChip text="Ignored" contentSlot={<em>Active</em>}>
          <span>Target</span>
        </RLChip>
      ));
      expect(html).toContain("Active");
      expect(html).not.toContain("Ignored");
    });
  });

  describe("Custom UI, Classes & Themes", () => {
    it("applies custom class to root", () => {
      const html = render(() => (
        <RLChip class="custom-chip-root">
          <span>Target</span>
        </RLChip>
      ));
      expect(slotTag(html, "root")).toContain("custom-chip-root");
    });

    it("applies ui slot class overrides for root and base", () => {
      const html = render(() => (
        <RLChip
          ui={{
            root: "custom-ui-root",
            base: "custom-ui-base",
          }}
        >
          <span>Target</span>
        </RLChip>
      ));
      expect(slotTag(html, "root")).toContain("custom-ui-root");
      expect(slotTag(html, "base")).toContain("custom-ui-base");
    });

    it("applies data-theme attribute", () => {
      const html = render(() => (
        <RLChip theme="dark">
          <span>Target</span>
        </RLChip>
      ));
      expect(attr(slotTag(html, "root"), "data-theme")).toBe("dark");
    });
  });
});
