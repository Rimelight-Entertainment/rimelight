import { describe, it, expect } from "vite-plus/test";
import { renderToString } from "@solidjs/web";

import { RLCarousel } from "../src/components/carousel/RLCarousel";
import { cleanHtml } from "./utils/normalize";

function render(fn: () => any): string {
  return cleanHtml(renderToString(fn));
}

function count(html: string, pattern: RegExp): number {
  return html.match(pattern)?.length ?? 0;
}

const slides = ["/a.jpg", "/b.jpg", "/c.jpg"];

describe("RLCarousel", () => {
  describe("Root", () => {
    it("renders a labelled carousel region", () => {
      const html = render(() => <RLCarousel items={slides} />);
      expect(html).toContain('role="region"');
      expect(html).toContain('aria-roledescription="carousel"');
      expect(html).toContain('data-slot="root"');
    });

    it("uses the aria-label prop", () => {
      const html = render(() => <RLCarousel items={slides} aria-label="Gallery" />);
      expect(html).toContain('aria-label="Gallery"');
    });

    it("applies the orientation variant to the root", () => {
      const html = render(() => <RLCarousel items={slides} orientation="vertical" />);
      expect(html).toContain('data-orientation="vertical"');
    });

    it("renders the requested root element", () => {
      const html = render(() => <RLCarousel items={slides} as="section" />);
      expect(html).toMatch(/^<section\b/);
      expect(html).toContain('data-slot="root"');
    });
  });

  describe("Slides", () => {
    it("renders one slide per string item", () => {
      const html = render(() => <RLCarousel items={slides} />);
      expect(count(html, /data-slot="item"/g)).toBe(3);
      expect(html).toContain('src="/b.jpg"');
    });

    it("renders captions for object items", () => {
      const html = render(() => (
        <RLCarousel
          items={[{ src: "/hero.jpg", title: "Hero", description: "Sunrise over the bay" }]}
        />
      ));
      expect(html).toContain('src="/hero.jpg"');
      expect(html).toContain("Hero");
      expect(html).toContain("Sunrise over the bay");
    });

    it("prefers imageSrc over src", () => {
      const html = render(() => (
        <RLCarousel items={[{ src: "/small.jpg", imageSrc: "/large.jpg" }]} />
      ));
      expect(html).toContain('src="/large.jpg"');
      expect(html).not.toContain("/small.jpg");
    });

    it("renders static children as slides when no items are given", () => {
      const html = render(() => (
        <RLCarousel>
          <p>First</p>
          <p>Second</p>
        </RLCarousel>
      ));
      expect(count(html, /data-slot="item"/g)).toBe(2);
      expect(html).toContain("First");
      expect(html).toContain("Second");
    });

    it("passes each item and its index to the children function", () => {
      const html = render(() => (
        <RLCarousel items={["alpha", "beta"]}>
          {(ctx) => <span data-index={ctx.index}>{String(ctx.item)}</span>}
        </RLCarousel>
      ));
      expect(html).toContain('data-index="0"');
      expect(html).toContain('data-index="1"');
      expect(html).toContain("beta");
    });

    it("marks the start index slide as the active item", () => {
      const html = render(() => <RLCarousel items={slides} startIndex={1} />);
      expect(html).toMatch(/data-state="active"/);
      expect(count(html, /data-state="active"/g)).toBe(1);
    });

    it("adds state classes to the snapped slide when stateClasses is enabled", () => {
      const html = render(() => <RLCarousel items={slides} stateClasses startIndex={2} />);
      expect(count(html, /is-snapped/g)).toBe(1);
      expect(html).toContain("is-in-view");
    });

    it("uses custom state class names", () => {
      const html = render(() => (
        <RLCarousel items={slides} stateClasses={{ snapped: "current" }} />
      ));
      expect(html).toContain("current");
      expect(html).not.toContain("is-snapped");
    });
  });

  describe("Arrows", () => {
    it("does not render arrows by default", () => {
      const html = render(() => <RLCarousel items={slides} />);
      expect(html).not.toContain('data-slot="prev"');
      expect(html).not.toContain('data-slot="next"');
    });

    it("renders previous and next arrows when enabled", () => {
      const html = render(() => <RLCarousel items={slides} arrows />);
      expect(html).toContain('data-slot="prev"');
      expect(html).toContain('data-slot="next"');
    });

    it("disables the previous arrow on the first slide without loop", () => {
      const html = render(() => <RLCarousel items={slides} arrows />);
      const prevTag = html.match(/<button\b[^>]*data-slot="prev"[^>]*>/)?.[0] ?? "";
      expect(prevTag).toContain("disabled");
    });

    it("keeps the previous arrow enabled on the first slide with loop", () => {
      const html = render(() => <RLCarousel items={slides} arrows loop />);
      const prevTag = html.match(/<button\b[^>]*data-slot="prev"[^>]*>/)?.[0] ?? "";
      expect(prevTag).not.toMatch(/\sdisabled(=""|\s|>)/);
    });

    it("renders custom prev and next slot content in place of the icon", () => {
      const html = render(() => (
        <RLCarousel
          items={slides}
          arrows
          prevSlot={() => <span data-testid="custom-prev">Back</span>}
          nextSlot={() => <span data-testid="custom-next">Forward</span>}
        />
      ));
      expect(html).toContain('data-testid="custom-prev"');
      expect(html).toContain('data-testid="custom-next"');
      expect(html).not.toContain('data-slot="leading-icon"');
    });
  });

  describe("Dots", () => {
    it("does not render dots by default", () => {
      const html = render(() => <RLCarousel items={slides} />);
      expect(html).not.toContain('data-slot="dots"');
    });

    it("renders one dot per slide", () => {
      const html = render(() => <RLCarousel items={slides} hasDots />);
      expect(count(html, /data-slot="dot"/g)).toBe(3);
    });

    it("marks the selected dot as active", () => {
      const html = render(() => <RLCarousel items={slides} hasDots startIndex={2} />);
      const activeDot = html.match(/<button\b[^>]*data-slot="dot"[^>]*data-state="active"[^>]*>/);
      expect(activeDot).not.toBeNull();
    });
  });

  describe("Fade", () => {
    it("publishes the transition duration as a CSS variable", () => {
      const html = render(() => <RLCarousel items={slides} fade duration={800} />);
      expect(html).toContain("--rl-carousel-duration:800ms");
      expect(html).not.toContain("--rl-carousel-transform:");
    });

    it("publishes the slide transform when not fading", () => {
      const html = render(() => <RLCarousel items={slides} />);
      expect(html).toContain("--rl-carousel-transform");
    });
  });
});
