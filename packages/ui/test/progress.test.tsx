import { describe, it, expect } from "vite-plus/test";
import { renderToString } from "@solidjs/web";

import { RLProgress } from "../src/components/progress/RLProgress";
import { cleanHtml } from "./utils/normalize";

function render(fn: () => any): string {
  return cleanHtml(renderToString(fn));
}

function slotTag(html: string, slot: string): string {
  const match = html.match(new RegExp(`<[a-z0-9-]+[^>]*data-slot="${slot}"[^>]*>`));
  return match?.[0] ?? "";
}

function attr(tag: string, name: string): string | undefined {
  return tag.match(new RegExp(`\\s${name}="([^"]*)"`))?.[1];
}

function indicatorWidth(html: string): string | undefined {
  return attr(slotTag(html, "indicator"), "style")?.match(/--rl-progress:\s*([^;]+)/)?.[1];
}

describe("RLProgress", () => {
  describe("progressbar semantics", () => {
    it("defaults to a 0 of 100 range", () => {
      const root = slotTag(
        render(() => <RLProgress />),
        "root",
      );
      expect(attr(root, "role")).toBe("progressbar");
      expect(attr(root, "aria-valuemin")).toBe("0");
      expect(attr(root, "aria-valuemax")).toBe("100");
      expect(attr(root, "aria-valuenow")).toBe("0");
    });

    it("exposes value and max on the progressbar and sets the indicator width", () => {
      const html = render(() => <RLProgress value={30} max={60} />);
      const root = slotTag(html, "root");
      expect(attr(root, "aria-valuenow")).toBe("30");
      expect(attr(root, "aria-valuemax")).toBe("60");
      expect(indicatorWidth(html)).toBe("50%");
    });

    it("forwards kebab-case aria attributes to the progressbar", () => {
      const root = slotTag(
        render(() => <RLProgress aria-label="Upload" aria-describedby="upload-hint" />),
        "root",
      );
      expect(attr(root, "aria-label")).toBe("Upload");
      expect(attr(root, "aria-describedby")).toBe("upload-hint");
    });

    it("keeps value and max out of the DOM", () => {
      const root = slotTag(
        render(() => <RLProgress value={10} max={20} />),
        "root",
      );
      expect(root).not.toMatch(/\svalue=/);
      expect(root).not.toMatch(/\smax=/);
    });

    it("honors as", () => {
      const html = render(() => <RLProgress as="span" value={5} />);
      expect(html.startsWith("<span")).toBe(true);
      expect(attr(slotTag(html, "root"), "role")).toBe("progressbar");
    });
  });

  describe("value clamping", () => {
    it("clamps values above max to max", () => {
      const html = render(() => <RLProgress value={150} />);
      expect(attr(slotTag(html, "root"), "aria-valuenow")).toBe("100");
      expect(indicatorWidth(html)).toBe("100%");
    });

    it("clamps negative values to 0", () => {
      const html = render(() => <RLProgress value={-20} />);
      expect(attr(slotTag(html, "root"), "aria-valuenow")).toBe("0");
      expect(indicatorWidth(html)).toBe("0%");
    });

    it("clamps infinite values into range", () => {
      const html = render(() => <RLProgress value={Number.POSITIVE_INFINITY} />);
      expect(attr(slotTag(html, "root"), "aria-valuenow")).toBe("100");
      expect(indicatorWidth(html)).toBe("100%");
    });

    it("reads a missing or NaN value as 0", () => {
      expect(indicatorWidth(render(() => <RLProgress />))).toBe("0%");
      const html = render(() => <RLProgress value={Number.NaN} />);
      expect(attr(slotTag(html, "root"), "aria-valuenow")).toBe("0");
      expect(indicatorWidth(html)).toBe("0%");
    });
  });

  describe("boundaries", () => {
    it("reports 100% when value equals max", () => {
      expect(indicatorWidth(render(() => <RLProgress value={40} max={40} />))).toBe("100%");
    });

    it("falls back to a 100 range for a zero, negative, NaN, or infinite max", () => {
      for (const max of [0, -5, Number.NaN, Number.POSITIVE_INFINITY]) {
        const html = render(() => <RLProgress value={50} max={max} />);
        const root = slotTag(html, "root");
        expect(attr(root, "aria-valuemax")).toBe("100");
        expect(attr(root, "aria-valuenow")).toBe("50");
        expect(indicatorWidth(html)).toBe("50%");
      }
    });

    it("uses a fractional max as the range", () => {
      const html = render(() => <RLProgress value={0.5} max={2} />);
      expect(attr(slotTag(html, "root"), "aria-valuemax")).toBe("2");
      expect(indicatorWidth(html)).toBe("25%");
    });
  });

  describe("appearance and slots", () => {
    it("writes the width only through the --rl-progress variable", () => {
      const html = render(() => <RLProgress value={25} />);
      expect(attr(slotTag(html, "root"), "style")).toBeUndefined();
      expect(attr(slotTag(html, "indicator"), "style")).toMatch(/--rl-progress:\s*25%/);
    });

    it("defaults to the primary color and honors an explicit color", () => {
      const primary =
        attr(
          slotTag(
            render(() => <RLProgress />),
            "root",
          ),
          "class",
        ) ?? "";
      expect(primary.split(" ")).toContain("rl-color-primary");
      const error = attr(
        slotTag(
          render(() => <RLProgress color="error" />),
          "root",
        ),
        "class",
      );
      expect((error ?? "").split(" ")).toContain("rl-color-error");
    });

    it("applies the size variant to the root", () => {
      const lg =
        attr(
          slotTag(
            render(() => <RLProgress size="lg" />),
            "root",
          ),
          "class",
        ) ?? "";
      expect(lg.split(" ")).toContain("h-5");
    });

    it("renders children after the indicator inside the root", () => {
      const html = render(() => (
        <RLProgress value={1}>
          <span>label</span>
        </RLProgress>
      ));
      expect(html.indexOf("<span>label</span>")).toBeGreaterThan(
        html.indexOf('data-slot="indicator"'),
      );
    });
  });
});
