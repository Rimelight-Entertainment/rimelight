import { describe, it, expect } from "vite-plus/test";
import { renderToString } from "@solidjs/web";

import { RLMarquee } from "../src/components/marquee/RLMarquee";
import { cleanHtml } from "./utils/normalize";

function render(fn: () => any): string {
  return cleanHtml(renderToString(fn));
}

function slotTag(html: string, slot: string): string {
  const match = html.match(new RegExp(`<[a-z0-9]+[^>]*data-slot="${slot}"[^>]*>`));
  return match?.[0] ?? "";
}

function attr(tag: string, name: string): string | undefined {
  const match = tag.match(new RegExp(`\\s${name}(?:="([^"]*)")?(?=[\\s>])`));
  return match ? (match[1] ?? "") : undefined;
}

function countMatches(html: string, pattern: RegExp): number {
  return html.match(pattern)?.length ?? 0;
}

describe("RLMarquee", () => {
  describe("Structure", () => {
    it("renders a root with two tracks", () => {
      const html = render(() => <RLMarquee>Item</RLMarquee>);
      expect(slotTag(html, "root")).not.toBe("");
      expect(countMatches(html, /data-slot="track"/g)).toBe(2);
    });

    it("renders children in both tracks so the loop is seamless", () => {
      const html = render(() => (
        <RLMarquee>
          <span>Logo</span>
        </RLMarquee>
      ));
      expect(countMatches(html, /Logo/g)).toBe(2);
    });

    it("hides only the duplicate track from assistive tech", () => {
      const html = render(() => <RLMarquee>Item</RLMarquee>);
      const [first, second] = html.match(/<div[^>]*data-slot="track"[^>]*>/g) ?? [];
      expect(attr(first ?? "", "aria-hidden")).toBeUndefined();
      expect(attr(second ?? "", "aria-hidden")).toBe("true");
    });

    it("renders empty tracks when there are no children", () => {
      const html = render(() => <RLMarquee />);
      expect(countMatches(html, /data-slot="track"/g)).toBe(2);
    });

    it("honours `as` for the root element", () => {
      expect(render(() => <RLMarquee>Item</RLMarquee>)).toMatch(/^<div/);
      expect(render(() => <RLMarquee as="section">Item</RLMarquee>)).toMatch(/^<section/);
    });

    it("forwards theme to data-theme and merges class onto the root", () => {
      const root = slotTag(
        render(() => <RLMarquee theme="dark" class="custom-marquee" />),
        "root",
      );
      expect(attr(root, "data-theme")).toBe("dark");
      expect(attr(root, "class")).toContain("custom-marquee");
    });
  });

  describe("Speed", () => {
    it("sets the animation duration from a numeric speed in seconds", () => {
      const root = slotTag(
        render(() => <RLMarquee speed={25} />),
        "root",
      );
      expect(attr(root, "style")).toContain("--rl-marquee-speed:25s");
    });

    it("leaves the theme duration in effect when speed is omitted", () => {
      const root = slotTag(
        render(() => <RLMarquee />),
        "root",
      );
      expect(attr(root, "style") ?? "").not.toContain("--rl-marquee-speed");
    });

    it("does not leak speed onto the DOM as an attribute", () => {
      const root = slotTag(
        render(() => <RLMarquee speed={25} />),
        "root",
      );
      expect(attr(root, "speed")).toBeUndefined();
    });
  });

  describe("Gap", () => {
    it("converts a numeric gap to pixels", () => {
      const root = slotTag(
        render(() => <RLMarquee gap={16} />),
        "root",
      );
      expect(attr(root, "style")).toContain("--marquee-gap:16px");
    });

    it("passes a string gap through unchanged", () => {
      const root = slotTag(
        render(() => <RLMarquee gap="2rem" />),
        "root",
      );
      expect(attr(root, "style")).toContain("--marquee-gap:2rem");
    });
  });

  describe("Orientation and reverse", () => {
    it("defaults to horizontal and not reversed", () => {
      const root = slotTag(
        render(() => <RLMarquee />),
        "root",
      );
      expect(attr(root, "data-orientation")).toBe("horizontal");
      expect(attr(root, "data-reverse")).toBeUndefined();
    });

    it("applies vertical orientation", () => {
      const root = slotTag(
        render(() => <RLMarquee orientation="vertical" />),
        "root",
      );
      expect(attr(root, "data-orientation")).toBe("vertical");
    });

    it("marks the marquee as reversed when reverse is set", () => {
      const root = slotTag(
        render(() => <RLMarquee reverse />),
        "root",
      );
      expect(attr(root, "data-reverse")).toBe("");
    });

    it("keeps reverse out of the DOM as an attribute value", () => {
      const root = slotTag(
        render(() => <RLMarquee reverse orientation="vertical" />),
        "root",
      );
      expect(attr(root, "data-orientation")).toBe("vertical");
      expect(attr(root, "reverse")).toBeUndefined();
    });
  });

  describe("Pause on hover", () => {
    it("pauses on hover by default", () => {
      const root = slotTag(
        render(() => <RLMarquee />),
        "root",
      );
      expect(attr(root, "data-pause-on-hover")).toBe("");
    });

    it("does not pause on hover when pauseOnHover is false", () => {
      const root = slotTag(
        render(() => <RLMarquee pauseOnHover={false} />),
        "root",
      );
      expect(attr(root, "data-pause-on-hover")).toBeUndefined();
    });
  });
});
