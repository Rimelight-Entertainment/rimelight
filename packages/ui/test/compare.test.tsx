import { describe, it, expect, vi } from "vite-plus/test";
import { renderToString } from "@solidjs/web";

vi.mock("virtual:rimelight/ui", () => ({
  default: {
    unstyled: false,
    components: { themes: {} },
    icons: {},
  },
}));

import { RLCompare } from "../src/components/compare/RLCompare";
import * as components from "../src/components/index";
import { cleanHtml } from "./utils/normalize";

function slotTag(html: string, slot: string): string {
  const match = html.match(new RegExp(`<[a-z0-9-]+[^>]*data-slot="${slot}"[^>]*>`));
  return match?.[0] ?? "";
}

function attr(tag: string, name: string): string | undefined {
  return tag.match(new RegExp(`\\s${name}="([^"]*)"`))?.[1];
}

describe("RLCompare Component Test Suite", () => {
  describe("Exports", () => {
    it("exports RLCompare component from package index", () => {
      expect(components.RLCompare).toBeDefined();
    });
  });

  describe("Structure & Slots", () => {
    it("renders default structure with root, container, after, before, divider, and handle slots", () => {
      const html = cleanHtml(
        renderToString(() => (
          <RLCompare
            beforeSrc="/before.jpg"
            afterSrc="/after.jpg"
            beforeAlt="Original Photo"
            afterAlt="Edited Photo"
          />
        )),
      );

      expect(html).toMatch(/^<div/);
      expect(slotTag(html, "root")).not.toBe("");
      expect(slotTag(html, "container")).not.toBe("");
      expect(slotTag(html, "after")).not.toBe("");
      expect(slotTag(html, "before")).not.toBe("");
      expect(slotTag(html, "divider")).not.toBe("");
      expect(slotTag(html, "handle")).not.toBe("");
      expect(html).toContain('alt="Original Photo"');
      expect(html).toContain('alt="Edited Photo"');
    });

    it("renders polymorphic root element via as prop", () => {
      const sectionHtml = cleanHtml(
        renderToString(() => <RLCompare as="section" beforeSrc="/b.jpg" afterSrc="/a.jpg" />),
      );
      expect(sectionHtml).toMatch(/^<section/);

      const articleHtml = cleanHtml(
        renderToString(() => <RLCompare as="article" beforeSrc="/b.jpg" afterSrc="/a.jpg" />),
      );
      expect(articleHtml).toMatch(/^<article/);
    });
  });

  describe("Value & Clipping Calculation", () => {
    it("renders default value 50% with matching clip-path and handle position", () => {
      const html = cleanHtml(
        renderToString(() => <RLCompare beforeSrc="/b.jpg" afterSrc="/a.jpg" />),
      );

      const beforeSlot = slotTag(html, "before");
      expect(beforeSlot).toMatch(/clip-path:\s*inset\(0 calc\(100% - 50%\) 0 0\)/);

      const handleSlot = slotTag(html, "handle");
      expect(handleSlot).toMatch(/left:\s*50%/);
      expect(attr(handleSlot, "aria-valuenow")).toBe("50");
      expect(attr(handleSlot, "aria-valuetext")).toBe("50%");
    });

    it("applies custom controlled value and clip-path", () => {
      const html = cleanHtml(
        renderToString(() => <RLCompare value={75} beforeSrc="/b.jpg" afterSrc="/a.jpg" />),
      );

      const beforeSlot = slotTag(html, "before");
      expect(beforeSlot).toMatch(/clip-path:\s*inset\(0 calc\(100% - 75%\) 0 0\)/);

      const handleSlot = slotTag(html, "handle");
      expect(handleSlot).toMatch(/left:\s*75%/);
      expect(attr(handleSlot, "aria-valuenow")).toBe("75");
    });

    it("clamps value to min and max boundaries", () => {
      const htmlMin = cleanHtml(
        renderToString(() => (
          <RLCompare value={-20} min={10} max={90} beforeSrc="/b.jpg" afterSrc="/a.jpg" />
        )),
      );
      const handleMin = slotTag(htmlMin, "handle");
      expect(attr(handleMin, "aria-valuenow")).toBe("10");

      const htmlMax = cleanHtml(
        renderToString(() => (
          <RLCompare value={150} min={10} max={90} beforeSrc="/b.jpg" afterSrc="/a.jpg" />
        )),
      );
      const handleMax = slotTag(htmlMax, "handle");
      expect(attr(handleMax, "aria-valuenow")).toBe("90");
    });
  });

  describe("Orientation", () => {
    it("renders horizontal orientation by default with vertical divider and ew cursor", () => {
      const html = cleanHtml(
        renderToString(() => (
          <RLCompare orientation="horizontal" beforeSrc="/b.jpg" afterSrc="/a.jpg" />
        )),
      );

      const rootTag = slotTag(html, "root");
      expect(attr(rootTag, "data-orientation")).toBe("horizontal");

      const handleTag = slotTag(html, "handle");
      expect(attr(handleTag, "aria-orientation")).toBe("horizontal");
      expect(handleTag).toContain("cursor-ew-resize");
    });

    it("renders vertical orientation with horizontal divider, top-to-bottom clip, and ns cursor", () => {
      const html = cleanHtml(
        renderToString(() => (
          <RLCompare orientation="vertical" value={30} beforeSrc="/b.jpg" afterSrc="/a.jpg" />
        )),
      );

      const rootTag = slotTag(html, "root");
      expect(attr(rootTag, "data-orientation")).toBe("vertical");

      const beforeSlot = slotTag(html, "before");
      expect(beforeSlot).toMatch(/clip-path:\s*inset\(0 0 calc\(100% - 30%\) 0\)/);

      const handleTag = slotTag(html, "handle");
      expect(attr(handleTag, "aria-orientation")).toBe("vertical");
      expect(handleTag).toContain("cursor-ns-resize");
      expect(handleTag).toMatch(/top:\s*30%/);
    });
  });

  describe("Content Support", () => {
    it("renders custom JSX elements via before and after props", () => {
      const html = cleanHtml(
        renderToString(() => (
          <RLCompare
            before={<div class="p-4 bg-red-500">Left Version</div>}
            after={<div class="p-4 bg-blue-500">Right Version</div>}
          />
        )),
      );

      expect(html).toContain("Left Version");
      expect(html).toContain("Right Version");
    });

    it("renders dynamic function content receiving current value", () => {
      const html = cleanHtml(
        renderToString(() => (
          <RLCompare
            value={60}
            before={(val) => <span>Before at {val}%</span>}
            after={(val) => <span>After at {val}%</span>}
          />
        )),
      );

      expect(html).toContain("Before at 60%");
      expect(html).toContain("After at 60%");
    });

    it("renders children elements as [before, after] fallback", () => {
      const html = cleanHtml(
        renderToString(() => (
          <RLCompare>
            <div id="child-before">Child Before</div>
            <div id="child-after">Child After</div>
          </RLCompare>
        )),
      );

      expect(html).toContain("Child Before");
      expect(html).toContain("Child After");
    });
  });

  describe("Labels & Badges", () => {
    it("renders before and after labels when provided", () => {
      const html = cleanHtml(
        renderToString(() => (
          <RLCompare
            beforeSrc="/b.jpg"
            afterSrc="/a.jpg"
            beforeLabel="Before Polish"
            afterLabel="After Polish"
          />
        )),
      );

      expect(slotTag(html, "before-label")).not.toBe("");
      expect(slotTag(html, "after-label")).not.toBe("");
      expect(html).toContain("Before Polish");
      expect(html).toContain("After Polish");
    });

    it("applies custom label placements", () => {
      const html = cleanHtml(
        renderToString(() => (
          <RLCompare
            beforeSrc="/b.jpg"
            afterSrc="/a.jpg"
            beforeLabel="B"
            afterLabel="A"
            beforeLabelPlacement="bottom-left"
            afterLabelPlacement="bottom-right"
          />
        )),
      );

      const beforeLabel = slotTag(html, "before-label");
      const afterLabel = slotTag(html, "after-label");
      expect(beforeLabel).toContain("bottom-3 left-3");
      expect(afterLabel).toContain("bottom-3 right-3");
    });
  });

  describe("Handle, Divider, and Icons", () => {
    it("can hide handle and divider via props", () => {
      const html = cleanHtml(
        renderToString(() => (
          <RLCompare beforeSrc="/b.jpg" afterSrc="/a.jpg" showHandle={false} showDivider={false} />
        )),
      );

      expect(slotTag(html, "handle")).toBe("");
      expect(slotTag(html, "divider")).toBe("");
    });

    it("renders custom handle slot element or render function", () => {
      const html = cleanHtml(
        renderToString(() => (
          <RLCompare
            beforeSrc="/b.jpg"
            afterSrc="/a.jpg"
            handle={({ orientation, value }) => (
              <div data-custom-handle>
                {orientation}-{value}
              </div>
            )}
          />
        )),
      );

      expect(html).toContain("data-custom-handle");
      expect(html).toContain("horizontal-50");
    });
  });

  describe("Variants, Sizes & Theming", () => {
    it("renders size variants correctly", () => {
      for (const size of ["xs", "sm", "md", "lg", "xl"] as const) {
        const html = cleanHtml(
          renderToString(() => <RLCompare size={size} beforeSrc="/b.jpg" afterSrc="/a.jpg" />),
        );
        expect(html).toContain('data-slot="root"');
      }
    });

    it("renders visual variants correctly", () => {
      for (const variant of ["solid", "outline", "subtle", "glass"] as const) {
        const html = cleanHtml(
          renderToString(() => (
            <RLCompare variant={variant} beforeSrc="/b.jpg" afterSrc="/a.jpg" />
          )),
        );
        expect(html).toContain('data-slot="root"');
      }
    });

    it("supports custom class and ui slot overrides", () => {
      const html = cleanHtml(
        renderToString(() => (
          <RLCompare
            class="my-custom-root shadow-2xl"
            ui={{
              handle: "custom-handle-class",
              divider: "custom-divider-class",
            }}
            beforeSrc="/b.jpg"
            afterSrc="/a.jpg"
          />
        )),
      );

      expect(slotTag(html, "root")).toContain("my-custom-root");
      expect(slotTag(html, "root")).toContain("shadow-2xl");
      expect(slotTag(html, "handle")).toContain("custom-handle-class");
      expect(slotTag(html, "divider")).toContain("custom-divider-class");
    });
  });

  describe("Accessibility (WAI-ARIA)", () => {
    it("provides complete ARIA slider attributes on handle", () => {
      const html = cleanHtml(
        renderToString(() => (
          <RLCompare
            value={42}
            min={0}
            max={100}
            ariaLabel="Custom image comparison"
            beforeSrc="/b.jpg"
            afterSrc="/a.jpg"
          />
        )),
      );

      const handleTag = slotTag(html, "handle");
      expect(attr(handleTag, "role")).toBe("slider");
      expect(attr(handleTag, "tabindex")).toBe("0");
      expect(attr(handleTag, "aria-valuenow")).toBe("42");
      expect(attr(handleTag, "aria-valuemin")).toBe("0");
      expect(attr(handleTag, "aria-valuemax")).toBe("100");
      expect(attr(handleTag, "aria-valuetext")).toBe("42%");
      expect(attr(handleTag, "aria-label")).toBe("Custom image comparison");
    });

    it("handles disabled state with tabindex -1 and aria-disabled", () => {
      const html = cleanHtml(
        renderToString(() => <RLCompare disabled={true} beforeSrc="/b.jpg" afterSrc="/a.jpg" />),
      );

      const rootTag = slotTag(html, "root");
      expect(attr(rootTag, "data-disabled")).toBe("true");

      const handleTag = slotTag(html, "handle");
      expect(attr(handleTag, "tabindex")).toBe("-1");
      expect(attr(handleTag, "aria-disabled")).toBe("true");
    });
  });
});
