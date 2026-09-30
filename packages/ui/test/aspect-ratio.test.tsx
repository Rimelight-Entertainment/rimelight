import { describe, it, expect, vi } from "vite-plus/test";
import { renderToString } from "@solidjs/web";

vi.mock("virtual:rimelight/ui", () => ({
  default: {
    unstyled: false,
    components: { themes: {} },
    icons: {}
  }
}));

import { RLAspectRatio } from "../src/components/aspect-ratio/RLAspectRatio";
import { renderSolid, cleanHtml } from "./utils/normalize";

describe("RLAspectRatio Solid Component Suite", () => {
  describe("Default Rendering & Structure", () => {
    it("renders default 1:1 container with root, spacer, and content slots", () => {
      const html = renderSolid(RLAspectRatio, {}, "Content Box");

      expect(html).toContain('data-slot="root"');
      expect(html).toContain('data-ratio="1"');
      expect(html).toContain('data-slot="spacer"');
      expect(html).toContain('aria-hidden="true"');
      expect(html).toContain('viewBox="0 0 100 100"');
      expect(html).toContain('data-slot="content"');
      expect(html).toContain("Content Box");
    });

    it("applies default theme classes to root, spacer, and content slots", () => {
      const html = renderSolid(RLAspectRatio, {}, "Themed Content");

      // Root base classes
      expect(html).toContain("relative");
      expect(html).toContain("w-full");
      expect(html).toContain("overflow-hidden");

      // Spacer base classes
      expect(html).toContain("block");
      expect(html).toContain("h-auto");
      expect(html).toContain("pointer-events-none");

      // Content base classes
      expect(html).toContain("absolute");
      expect(html).toContain("inset-0");
      expect(html).toContain("object-cover");
    });
  });

  describe("Aspect Ratio Calculations & SVG Spacer ViewBox", () => {
    const testCases: Array<{
      name: string;
      ratio: number;
      expectedRatioAttr: string;
      expectedViewBox: string;
    }> = [
      {
        name: "widescreen 16:9",
        ratio: 16 / 9,
        expectedRatioAttr: (16 / 9).toString(),
        expectedViewBox: `0 0 100 ${56.25}`
      },
      {
        name: "standard 4:3",
        ratio: 4 / 3,
        expectedRatioAttr: (4 / 3).toString(),
        expectedViewBox: `0 0 100 ${75}`
      },
      {
        name: "square 1:1",
        ratio: 1,
        expectedRatioAttr: "1",
        expectedViewBox: "0 0 100 100"
      },
      {
        name: "portrait 9:16",
        ratio: 9 / 16,
        expectedRatioAttr: (9 / 16).toString(),
        expectedViewBox: `0 0 100 ${(1 / (9 / 16)) * 100}`
      },
      {
        name: "cinema ultrawide 21:9",
        ratio: 21 / 9,
        expectedRatioAttr: (21 / 9).toString(),
        expectedViewBox: `0 0 100 ${(1 / (21 / 9)) * 100}`
      },
      {
        name: "double width 2:1",
        ratio: 2,
        expectedRatioAttr: "2",
        expectedViewBox: "0 0 100 50"
      },
      {
        name: "tall strip 1:2",
        ratio: 0.5,
        expectedRatioAttr: "0.5",
        expectedViewBox: "0 0 100 200"
      }
    ];

    for (const { name, ratio, expectedRatioAttr, expectedViewBox } of testCases) {
      it(`computes accurate viewBox and data-ratio for ${name}`, () => {
        const html = renderSolid(RLAspectRatio, { ratio }, "Ratio Child");

        expect(html).toContain(`data-ratio="${expectedRatioAttr}"`);
        expect(html).toContain(`viewBox="${expectedViewBox}"`);
      });
    }
  });

  describe("Guarding Invalid & Edge-case Ratios", () => {
    it("falls back to 1:1 when ratio is 0", () => {
      const html = renderSolid(RLAspectRatio, { ratio: 0 }, "Zero Ratio");
      expect(html).toContain('data-ratio="1"');
      expect(html).toContain('viewBox="0 0 100 100"');
    });

    it("falls back to 1:1 when ratio is negative", () => {
      const html = renderSolid(RLAspectRatio, { ratio: -1.5 }, "Negative Ratio");
      expect(html).toContain('data-ratio="1"');
      expect(html).toContain('viewBox="0 0 100 100"');
    });

    it("falls back to 1:1 when ratio is NaN", () => {
      const html = renderSolid(RLAspectRatio, { ratio: Number.NaN }, "NaN Ratio");
      expect(html).toContain('data-ratio="1"');
      expect(html).toContain('viewBox="0 0 100 100"');
    });

    it("falls back to 1:1 when ratio is positive Infinity", () => {
      const html = renderSolid(
        RLAspectRatio,
        { ratio: Number.POSITIVE_INFINITY },
        "Infinity Ratio"
      );
      expect(html).toContain('data-ratio="1"');
      expect(html).toContain('viewBox="0 0 100 100"');
    });

    it("falls back to 1:1 when ratio is negative Infinity", () => {
      const html = renderSolid(
        RLAspectRatio,
        { ratio: Number.NEGATIVE_INFINITY },
        "Negative Infinity Ratio"
      );
      expect(html).toContain('data-ratio="1"');
      expect(html).toContain('viewBox="0 0 100 100"');
    });
  });

  describe("Polymorphic as Prop", () => {
    const customTags = ["section", "figure", "article", "aside", "main", "span"] as const;

    for (const tag of customTags) {
      it(`renders root element as <${tag}> when as="${tag}"`, () => {
        const html = renderSolid(RLAspectRatio, { as: tag, ratio: 16 / 9 }, "Polymorphic Tag");
        expect(html.startsWith(`<${tag}`)).toBe(true);
        expect(html.endsWith(`</${tag}>`)).toBe(true);
        expect(html).toContain('data-slot="root"');
      });
    }
  });

  describe("Custom Styling, Theme Classes & UI Overrides", () => {
    it("applies custom class to root element", () => {
      const html = renderSolid(
        RLAspectRatio,
        { class: "shadow-2xl rounded-xl custom-aspect" },
        "Custom Class"
      );
      expect(html).toContain("custom-aspect");
      expect(html).toContain("shadow-2xl");
      expect(html).toContain("rounded-xl");
      expect(html).toContain("relative"); // Preserves base classes
    });

    it("overrides slots via ui prop", () => {
      const html = renderSolid(
        RLAspectRatio,
        {
          ui: {
            root: "border-4 border-primary",
            spacer: "opacity-50",
            content: "bg-elevated/80"
          }
        },
        "Slot Overrides"
      );

      expect(html).toContain("border-4");
      expect(html).toContain("border-primary");
      expect(html).toContain("opacity-50");
      expect(html).toContain("bg-elevated/80");
    });

    it("supports functional or nested ui overrides seamlessly", () => {
      const html = renderSolid(
        RLAspectRatio,
        {
          ui: {
            root: ["ring-1", "ring-emerald-500"],
            content: "p-4 flex items-center justify-center"
          }
        },
        "Nested UI"
      );

      expect(html).toContain("ring-1");
      expect(html).toContain("ring-emerald-500");
      expect(html).toContain("p-4");
    });
  });

  describe("Attribute Forwarding & Rest Props Sanitization", () => {
    it("forwards standard HTML attributes, accessibility attributes, and event handlers", () => {
      const html = renderSolid(
        RLAspectRatio,
        {
          id: "custom-media-frame",
          "data-testid": "aspect-ratio-test",
          role: "region",
          "aria-label": "Video container",
          tabindex: "0"
        },
        "Accessible Frame"
      );

      expect(html).toContain('id="custom-media-frame"');
      expect(html).toContain('data-testid="aspect-ratio-test"');
      expect(html).toContain('role="region"');
      expect(html).toContain('aria-label="Video container"');
      expect(html).toContain('tabindex="0"');
    });

    it("omits internal component props from being rendered as DOM attributes", () => {
      const html = renderSolid(
        RLAspectRatio,
        {
          ratio: 16 / 9,
          ui: { root: "custom" },
          class: "my-class"
        },
        "Omitted Props"
      );

      expect(html).not.toContain('ui="');
      expect(html).not.toContain('as="');
    });
  });

  describe("Children Rendering & Media Content Integration", () => {
    it("renders image JSX elements inside the content slot", () => {
      const html = cleanHtml(
        renderToString(() => (
          <RLAspectRatio ratio={16 / 9}>
            <img src="https://example.com/banner.webp" alt="Banner Image" class="object-cover" />
          </RLAspectRatio>
        ))
      );

      expect(html).toContain('data-slot="content"');
      expect(html).toContain("<img");
      expect(html).toContain('src="https://example.com/banner.webp"');
      expect(html).toContain('alt="Banner Image"');
    });

    it("renders video element inside the content slot", () => {
      const html = cleanHtml(
        renderToString(() => (
          <RLAspectRatio ratio={16 / 9}>
            <video src="https://example.com/trailer.mp4" controls autoplay />
          </RLAspectRatio>
        ))
      );

      expect(html).toContain("<video");
      expect(html).toContain('src="https://example.com/trailer.mp4"');
      expect(html).toContain("controls");
    });
  });
});
