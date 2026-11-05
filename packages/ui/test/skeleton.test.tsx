import { describe, it, expect } from "vite-plus/test";
import { renderToString } from "@solidjs/web";
import { RLSkeleton } from "../src/components/skeleton/RLSkeleton";
import { isLeafElement, extractSkeletonRects } from "../src/components/skeleton/skeleton.helpers";
import { mountComponent } from "./utils/browser-render";

describe("RLSkeleton", () => {
  describe("standalone (no children)", () => {
    it("renders a root without measure or overlay layers", () => {
      const html = renderToString(() => <RLSkeleton />);
      expect(html).toContain('data-slot="root"');
      expect(html).not.toContain('data-slot="measure"');
      expect(html).not.toContain('data-slot="overlay"');
    });
  });

  describe("with children", () => {
    it("renders measure and overlay layers while loading", () => {
      const html = renderToString(() => (
        <RLSkeleton loading={true}>
          <p>Profile description</p>
        </RLSkeleton>
      ));
      expect(html).toContain('data-slot="measure"');
      expect(html).toContain('data-slot="overlay"');
    });

    it("renders children without skeleton layers when loading is false", () => {
      const html = renderToString(() => (
        <RLSkeleton loading={false}>
          <p>Profile description</p>
        </RLSkeleton>
      ));
      expect(html).toContain("Profile description");
      expect(html).not.toContain('data-slot="measure"');
      expect(html).not.toContain('data-slot="overlay"');
    });
  });

  describe("mounted", () => {
    it("keeps the measure layer in the live DOM while loading", () => {
      const container = mountComponent(() => (
        <RLSkeleton loading={true}>
          <div>
            <h4>Profile Title</h4>
          </div>
        </RLSkeleton>
      ));

      expect(container.querySelector('[data-slot="measure"]')).not.toBeNull();
      expect(container.querySelector('[data-slot="overlay"]')).not.toBeNull();
    });
  });
});

describe("skeleton helpers", () => {
  it("treats text-only and replaced elements as leaves and containers of blocks as non-leaves", () => {
    const text = document.createElement("div");
    text.textContent = "Hello world";
    expect(isLeafElement(text)).toBe(true);

    const image = document.createElement("img");
    expect(isLeafElement(image)).toBe(true);

    const wrapper = document.createElement("div");
    wrapper.appendChild(document.createElement("p"));
    expect(isLeafElement(wrapper)).toBe(false);
  });

  it("skips elements marked with data-skeleton-ignore", () => {
    const container = document.createElement("div");
    const visible = document.createElement("div");
    visible.textContent = "Visible skeleton";
    const ignored = document.createElement("div");
    ignored.setAttribute("data-skeleton-ignore", "true");
    ignored.textContent = "Ignored element";
    // happy-dom has no layout engine and reports zero-size boxes, which the helper skips.
    // Give both fixtures a box so only the ignore marker decides which one is measured.
    visible.getBoundingClientRect = () => new window.DOMRect(0, 0, 120, 16);
    ignored.getBoundingClientRect = () => new window.DOMRect(0, 24, 120, 16);
    container.append(visible, ignored);
    document.body.appendChild(container);

    try {
      expect(extractSkeletonRects(container)).toHaveLength(1);
    } finally {
      container.remove();
    }
  });
});
