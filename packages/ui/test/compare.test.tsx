import { describe, it, expect } from "vite-plus/test";
import { renderToString } from "@solidjs/web";

import { RLCompare } from "../src/components/compare/RLCompare";
import { cleanHtml } from "./utils/normalize";

function render(fn: () => any): string {
  return cleanHtml(renderToString(fn));
}

function slotTag(html: string, slot: string): string {
  const match = html.match(new RegExp(`<[a-z0-9]+[^>]*data-slot="${slot}"[^>]*>`));
  return match?.[0] ?? "";
}

function slotContent(html: string, slot: string): string {
  const match = html.match(
    new RegExp(`<([a-z0-9]+)[^>]*data-slot="${slot}"[^>]*>([\\s\\S]*?)</\\1>`),
  );
  return match?.[2] ?? "";
}

// Solid SSR writes empty-string attributes on spread elements as bare names (HTML-equivalent to name="").
function attr(tag: string, name: string): string | undefined {
  const match = tag.match(new RegExp(`\\s${name}(?:="([^"]*)")?(?=[\\s>])`));
  return match ? (match[1] ?? "") : undefined;
}

describe("RLCompare", () => {
  describe("Structure", () => {
    it("renders the root, layers, divider, and handle by default", () => {
      const html = render(() => <RLCompare beforeSrc="/before.jpg" afterSrc="/after.jpg" />);

      expect(slotTag(html, "root")).not.toBe("");
      expect(slotTag(html, "container")).not.toBe("");
      expect(slotTag(html, "before")).not.toBe("");
      expect(slotTag(html, "after")).not.toBe("");
      expect(slotTag(html, "divider")).not.toBe("");
      expect(slotTag(html, "handle")).not.toBe("");
    });

    it("renders the polymorphic root through the as prop", () => {
      const html = render(() => <RLCompare as="section" beforeSrc="/b.jpg" afterSrc="/a.jpg" />);

      expect(html).toMatch(/^<section/);
    });

    it("forwards class and ui overrides to the root and handle", () => {
      const html = render(() => (
        <RLCompare
          class="root-override"
          ui={{ handle: "handle-override" }}
          beforeSrc="/b.jpg"
          afterSrc="/a.jpg"
        />
      ));

      expect(slotTag(html, "root")).toContain("root-override");
      expect(slotTag(html, "handle")).toContain("handle-override");
    });
  });

  describe("Value", () => {
    it("starts at 50 when no value is provided", () => {
      const handle = slotTag(
        render(() => <RLCompare />),
        "handle",
      );

      expect(attr(handle, "aria-valuenow")).toBe("50");
      expect(attr(handle, "aria-valuetext")).toBe("50%");
    });

    it("uses defaultValue as the initial position", () => {
      const handle = slotTag(
        render(() => <RLCompare defaultValue={30} />),
        "handle",
      );

      expect(attr(handle, "aria-valuenow")).toBe("30");
    });

    it("prefers a controlled value over defaultValue", () => {
      const handle = slotTag(
        render(() => <RLCompare value={70} defaultValue={30} />),
        "handle",
      );

      expect(attr(handle, "aria-valuenow")).toBe("70");
    });

    it("clamps the value to the default 0 to 100 range", () => {
      const high = slotTag(
        render(() => <RLCompare value={150} />),
        "handle",
      );
      const low = slotTag(
        render(() => <RLCompare value={-20} />),
        "handle",
      );

      expect(attr(high, "aria-valuenow")).toBe("100");
      expect(attr(low, "aria-valuenow")).toBe("0");
    });

    it("clamps the value to custom min and max bounds", () => {
      const handle = slotTag(
        render(() => <RLCompare value={10} min={20} max={80} />),
        "handle",
      );

      expect(attr(handle, "aria-valuemin")).toBe("20");
      expect(attr(handle, "aria-valuemax")).toBe("80");
      expect(attr(handle, "aria-valuenow")).toBe("20");
    });

    it("accepts the bounds themselves without clamping", () => {
      const atMax = slotTag(
        render(() => <RLCompare value={100} />),
        "handle",
      );
      const atMin = slotTag(
        render(() => <RLCompare value={0} />),
        "handle",
      );

      expect(attr(atMax, "aria-valuenow")).toBe("100");
      expect(attr(atMin, "aria-valuenow")).toBe("0");
    });

    it("writes the position as a CSS variable on the divider and handle", () => {
      const html = render(() => <RLCompare value={25} />);

      expect(html).toMatch(/--rl-compare-pos:\s*25%/);
    });
  });

  describe("Orientation", () => {
    it("is horizontal by default", () => {
      const html = render(() => <RLCompare />);
      const root = slotTag(html, "root");

      expect(attr(root, "data-orientation")).toBe("horizontal");
      expect(attr(slotTag(html, "handle"), "aria-orientation")).toBe("horizontal");
    });

    it("reports vertical orientation on the root and handle", () => {
      const html = render(() => <RLCompare orientation="vertical" />);

      expect(attr(slotTag(html, "root"), "data-orientation")).toBe("vertical");
      expect(attr(slotTag(html, "handle"), "aria-orientation")).toBe("vertical");
    });
  });

  describe("Content slots", () => {
    it("renders beforeSrc and afterSrc images in their layers", () => {
      const html = render(() => (
        <RLCompare
          beforeSrc="/before.jpg"
          afterSrc="/after.jpg"
          beforeAlt="Original"
          afterAlt="Edited"
        />
      ));

      expect(html).toContain('src="/before.jpg"');
      expect(html).toContain('src="/after.jpg"');
      expect(html).toContain('alt="Original"');
      expect(html).toContain('alt="Edited"');
    });

    it("prefers beforeLayerSlot over beforeSrc", () => {
      const html = render(() => (
        <RLCompare beforeSrc="/before.jpg" beforeLayerSlot={<span>Custom before</span>} />
      ));

      expect(html).toContain("Custom before");
      expect(html).not.toContain('src="/before.jpg"');
    });

    it("passes the current value to a render function beforeLayerSlot", () => {
      const html = render(() => (
        <RLCompare
          defaultValue={25}
          beforeLayerSlot={(value) => <span>{`before ${value}`}</span>}
        />
      ));

      expect(html).toContain("before 25");
    });

    it("passes the current value to a render function afterLayerSlot", () => {
      const html = render(() => (
        <RLCompare defaultValue={60} afterLayerSlot={(value) => <span>{`after ${value}`}</span>} />
      ));

      expect(html).toContain("after 60");
    });

    it("uses the first and second children for the before and after layers", () => {
      const html = render(() => (
        <RLCompare>
          <span>Left content</span>
          <span>Right content</span>
        </RLCompare>
      ));
      const beforeStart = html.indexOf('data-slot="before"');
      const afterStart = html.indexOf('data-slot="after"');

      expect(beforeStart).toBeGreaterThan(-1);
      expect(html.indexOf("Left content")).toBeGreaterThan(beforeStart);
      expect(html.indexOf("Right content")).toBeGreaterThan(afterStart);
      expect(html.indexOf("Right content")).toBeLessThan(beforeStart);
    });
  });

  describe("Labels", () => {
    it("renders label slots when labels are provided", () => {
      const html = render(() => <RLCompare beforeLabelSlot="Day" afterLabelSlot="Night" />);

      expect(slotTag(html, "before-label")).not.toBe("");
      expect(slotTag(html, "after-label")).not.toBe("");
      expect(html).toContain("Day");
      expect(html).toContain("Night");
    });

    it("hides labels when showLabels is false", () => {
      const html = render(() => (
        <RLCompare showLabels={false} beforeLabelSlot="Day" afterLabelSlot="Night" />
      ));

      expect(slotTag(html, "before-label")).toBe("");
      expect(slotTag(html, "after-label")).toBe("");
    });

    it("renders no labels when no label slot is provided", () => {
      const html = render(() => <RLCompare />);

      expect(slotTag(html, "before-label")).toBe("");
      expect(slotTag(html, "after-label")).toBe("");
    });
  });

  describe("Handle and divider", () => {
    it("hides the handle when hasHandle is false", () => {
      const html = render(() => <RLCompare hasHandle={false} />);

      expect(slotTag(html, "handle")).toBe("");
    });

    it("hides the divider when hasDivider is false", () => {
      const html = render(() => <RLCompare hasDivider={false} />);

      expect(slotTag(html, "divider")).toBe("");
    });

    it("passes orientation and value to a render function handleSlot", () => {
      const html = render(() => (
        <RLCompare
          orientation="vertical"
          defaultValue={40}
          handleSlot={({ orientation, value }) => <span>{`${orientation}:${value}`}</span>}
        />
      ));

      expect(slotContent(html, "handle")).toContain("vertical:40");
    });

    it("renders the handle with the supplied aria-label and aria-labelledby", () => {
      const labelled = slotTag(
        render(() => <RLCompare aria-label="Photo position" />),
        "handle",
      );
      const referenced = slotTag(
        render(() => <RLCompare aria-labelledby="compare-title" />),
        "handle",
      );

      expect(attr(labelled, "aria-label")).toBe("Photo position");
      expect(attr(referenced, "aria-labelledby")).toBe("compare-title");
    });

    it("provides a default accessible name for the handle", () => {
      const handle = slotTag(
        render(() => <RLCompare />),
        "handle",
      );

      expect(attr(handle, "aria-label")).toBeTruthy();
    });
  });

  describe("Disabled", () => {
    it("is interactive by default", () => {
      const html = render(() => <RLCompare />);
      const handle = slotTag(html, "handle");

      expect(attr(slotTag(html, "root"), "data-disabled")).toBeUndefined();
      expect(attr(handle, "aria-disabled")).toBeUndefined();
      expect(attr(handle, "tabindex")).toBe("0");
    });

    it("marks the root with a presence flag and removes the handle from tab order", () => {
      const html = render(() => <RLCompare disabled />);
      const handle = slotTag(html, "handle");

      expect(attr(slotTag(html, "root"), "data-disabled")).toBe("");
      expect(attr(handle, "aria-disabled")).toBe("true");
      expect(attr(handle, "tabindex")).toBe("-1");
    });
  });
});
