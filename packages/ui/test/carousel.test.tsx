import { describe, it, expect } from "vite-plus/test";

import { RLCarousel } from "../src/components/carousel/RLCarousel";
import * as components from "../src/components/index";
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

describe("RLCarousel", () => {
  const items = [
    "https://picsum.photos/640/640?random=1",
    "https://picsum.photos/640/640?random=2",
    "https://picsum.photos/640/640?random=3",
  ];

  describe("Exports", () => {
    it("exports RLCarousel component from index", () => {
      expect(components.RLCarousel).toBeDefined();
    });
  });

  describe("Structure, Slots & Props", () => {
    it("renders default carousel structure with items", () => {
      const html = render(() => <RLCarousel items={items} />);
      expect(html).toMatch(/^<div/);
      expect(slotTag(html, "root")).not.toBe("");
      expect(slotTag(html, "viewport")).not.toBe("");
      expect(slotTag(html, "container")).not.toBe("");
      expect(html).toContain(items[0]);
      expect(html).toContain(items[1]);
      expect(html).toContain(items[2]);
    });

    it("renders slides passed via slides prop", () => {
      const slides = [
        { imageSrc: "https://example.com/slide1.jpg", title: "Slide 1", description: "Desc 1" },
        { imageSrc: "https://example.com/slide2.jpg", title: "Slide 2" },
      ];
      const html = render(() => <RLCarousel slides={slides} />);
      expect(html).toContain("https://example.com/slide1.jpg");
      expect(html).toContain("Slide 1");
      expect(html).toContain("Desc 1");
      expect(html).toContain("Slide 2");
    });

    it("renders static children when no items/slides prop passed", () => {
      const html = render(() => (
        <RLCarousel>
          <div class="slide-a">Slide A</div>
          <div class="slide-b">Slide B</div>
        </RLCarousel>
      ));
      expect(html).toContain("Slide A");
      expect(html).toContain("Slide B");
      expect(html).toContain("slide-a");
    });

    it("renders scoped function children with items", () => {
      const html = render(() => (
        <RLCarousel items={items}>
          {(ctx: { item: string; index: number }) => (
            <span class="custom-item">
              Item {ctx.index}: {ctx.item}
            </span>
          )}
        </RLCarousel>
      ));
      expect(html).toContain("custom-item");
      expect(html).toContain(`Item 0: ${items[0]}`);
      expect(html).toContain(`Item 1: ${items[1]}`);
    });
  });

  describe("Arrows & Navigation Controls", () => {
    it("does not render arrows by default", () => {
      const html = render(() => <RLCarousel items={items} />);
      expect(slotTag(html, "arrows")).toBe("");
      expect(slotTag(html, "prev-button")).toBe("");
      expect(slotTag(html, "next-button")).toBe("");
    });

    it("renders prev and next arrow buttons when arrows is true", () => {
      const html = render(() => <RLCarousel items={items} arrows />);
      expect(slotTag(html, "arrows")).not.toBe("");
      expect(slotTag(html, "prev-button")).not.toBe("");
      expect(slotTag(html, "next-button")).not.toBe("");
    });

    it("customizes prev and next buttons with props", () => {
      const html = render(() => (
        <RLCarousel
          items={items}
          arrows
          prev={{ color: "primary", variant: "solid" }}
          next={{ color: "neutral", variant: "outline" }}
        />
      ));
      expect(slotTag(html, "prev-button")).toContain("rl-color-primary");
      expect(slotTag(html, "next-button")).toContain("rl-color-neutral");
    });
  });

  describe("Dots Navigation", () => {
    it("does not render dots by default", () => {
      const html = render(() => <RLCarousel items={items} />);
      expect(slotTag(html, "dots")).toBe("");
    });

    it("renders dots corresponding to number of items", () => {
      const html = render(() => <RLCarousel items={items} dots />);
      expect(slotTag(html, "dots")).not.toBe("");
      const dotMatches = html.match(/data-slot="dot"/g);
      expect(dotMatches?.length).toBe(3);
      expect(html).toContain('aria-label="Go to slide 1"');
      expect(html).toContain('aria-label="Go to slide 2"');
      expect(html).toContain('aria-label="Go to slide 3"');
    });

    it("marks the first dot active by default", () => {
      const html = render(() => <RLCarousel items={items} dots />);
      expect(html).toContain('data-state="active"');
      expect(html).toContain('aria-selected="true"');
    });

    it("marks startIndex active when specified", () => {
      const html = render(() => <RLCarousel items={items} dots startIndex={1} />);
      const secondDot = html.match(/<button[^>]*aria-label="Go to slide 2"[^>]*>/)?.[0];
      expect(secondDot).toContain('data-state="active"');
      expect(secondDot).toContain('aria-selected="true"');
    });
  });

  describe("Orientation", () => {
    it("defaults to horizontal orientation", () => {
      const html = render(() => <RLCarousel items={items} />);
      const root = slotTag(html, "root");
      expect(attr(root, "data-orientation")).toBe("horizontal");
    });

    it("renders vertical orientation correctly", () => {
      const html = render(() => <RLCarousel items={items} orientation="vertical" />);
      const root = slotTag(html, "root");
      expect(attr(root, "data-orientation")).toBe("vertical");
    });
  });

  describe("Plugins & Extended Features", () => {
    it("supports fade mode without breaking structure", () => {
      const html = render(() => <RLCarousel items={items} fade />);
      expect(slotTag(html, "root")).not.toBe("");
      expect(html).toContain("opacity-100");
    });

    it("supports classNames mode on snapped item", () => {
      const html = render(() => <RLCarousel items={items} classNames />);
      expect(html).toContain("is-snapped");
      expect(html).toContain("is-in-view");
    });

    it("supports custom classNames option overrides", () => {
      const html = render(() => (
        <RLCarousel
          items={items}
          classNames={{ snapped: "active-slide-class", inView: "visible-slide-class" }}
        />
      ));
      expect(html).toContain("active-slide-class");
      expect(html).toContain("visible-slide-class");
    });
  });

  describe("Polymorphism & Custom UI", () => {
    it("renders custom element via as prop", () => {
      const sectionHtml = render(() => <RLCarousel as="section" items={items} />);
      expect(sectionHtml).toMatch(/^<section/);

      const articleHtml = render(() => <RLCarousel as="article" items={items} />);
      expect(articleHtml).toMatch(/^<article/);
    });

    it("applies class prop to root element", () => {
      const html = render(() => <RLCarousel items={items} class="custom-carousel-cls" />);
      expect(slotTag(html, "root")).toContain("custom-carousel-cls");
    });

    it("applies ui slot overrides", () => {
      const html = render(() => (
        <RLCarousel
          items={items}
          arrows
          dots
          ui={{
            root: "custom-root-class",
            viewport: "custom-viewport-class",
            container: "custom-container-class",
            item: "basis-1/3",
            dots: "custom-dots-class",
            dot: "custom-dot-class",
          }}
        />
      ));
      expect(slotTag(html, "root")).toContain("custom-root-class");
      expect(slotTag(html, "viewport")).toContain("custom-viewport-class");
      expect(slotTag(html, "container")).toContain("custom-container-class");
      expect(slotTag(html, "item")).toContain("basis-1/3");
      expect(slotTag(html, "dots")).toContain("custom-dots-class");
      expect(slotTag(html, "dot")).toContain("custom-dot-class");
    });
  });

  describe("Accessibility (WAI-ARIA)", () => {
    it("renders region role and roledescription carousel", () => {
      const html = render(() => <RLCarousel items={items} ariaLabel="Featured products" />);
      const root = slotTag(html, "root");
      expect(attr(root, "role")).toBe("region");
      expect(attr(root, "aria-roledescription")).toBe("carousel");
      expect(attr(root, "aria-label")).toBe("Featured products");
    });

    it("renders group role and roledescription slide on items", () => {
      const html = render(() => <RLCarousel items={items} />);
      const itemTag = slotTag(html, "item");
      expect(attr(itemTag, "role")).toBe("group");
      expect(attr(itemTag, "aria-roledescription")).toBe("slide");
      expect(attr(itemTag, "aria-label")).toBe("1 of 3");
    });

    it("renders tablist and tabs for dots", () => {
      const html = render(() => <RLCarousel items={items} dots />);
      const dotsTag = slotTag(html, "dots");
      expect(attr(dotsTag, "role")).toBe("tablist");
      expect(attr(dotsTag, "aria-label")).toBe("Slides");
      const dotTag = slotTag(html, "dot");
      expect(attr(dotTag, "role")).toBe("tab");
    });
  });
});
