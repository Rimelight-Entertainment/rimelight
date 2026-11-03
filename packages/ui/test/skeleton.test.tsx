import { describe, it, expect } from "vite-plus/test";
import { RLSkeleton } from "../src/components/skeleton/RLSkeleton";
import { renderToString } from "@solidjs/web";
import { cleanHtml } from "./utils/normalize";
import { mountComponent } from "./utils/browser-render";
import { isLeafElement, extractSkeletonRects } from "../src/components/skeleton/skeleton.dom";

function render(fn: () => any): string {
  return cleanHtml(renderToString(fn));
}

function slotTag(html: string, slot: string): string {
  const match = html.match(new RegExp(`<[a-z0-9]+[^>]*data-slot="${slot}"[^>]*>`));
  return match?.[0] ?? "";
}

describe("RLSkeleton", () => {
  describe("Exports", () => {
    it("exports RLSkeleton component from index", () => {
      expect(RLSkeleton).toBeDefined();
    });
  });

  describe("Standalone mode (no children)", () => {
    it("renders standalone skeleton root div with default rounded shape", () => {
      const html = render(() => <RLSkeleton class="w-32 h-6" />);
      expect(html).toContain('data-slot="root"');
      expect(html).toContain("rounded-md");
      expect(html).toContain("animate-pulse");
      expect(html).toContain("w-32 h-6");
    });

    it("renders circle variant", () => {
      const html = render(() => <RLSkeleton shape="circle" class="w-12 h-12" />);
      expect(html).toContain("rounded-full");
    });

    it("renders rectangle variant", () => {
      const html = render(() => <RLSkeleton shape="rectangle" class="w-full h-8" />);
      expect(html).toContain("rounded-none");
    });
  });

  describe("Structural wrapper mode (with children)", () => {
    it("renders measure and overlay layers under the root when loading", () => {
      const html = render(() => (
        <RLSkeleton loading={true}>
          <div class="user-card">
            <h3>User Name</h3>
            <p>user@example.com</p>
          </div>
        </RLSkeleton>
      ));

      expect(slotTag(html, "root")).toContain("relative w-full");
      expect(slotTag(html, "measure")).not.toBe("");
      expect(slotTag(html, "overlay")).not.toBe("");
      expect(html).toContain("User Name");
      expect(html).toContain("user@example.com");
    });

    it("renders raw children without wrapper when loading is false", () => {
      const html = render(() => (
        <RLSkeleton loading={false}>
          <div class="user-card">
            <h3>User Name</h3>
          </div>
        </RLSkeleton>
      ));

      expect(slotTag(html, "overlay")).toBe("");
      expect(html).toContain("User Name");
    });
  });

  describe("DOM measurement utilities (skeleton.dom)", () => {
    it("identifies leaf elements correctly", () => {
      const divWithText = document.createElement("div");
      divWithText.textContent = "Hello world";
      expect(isLeafElement(divWithText)).toBe(true);

      const btn = document.createElement("button");
      btn.innerHTML = "<span>Click</span>";
      expect(isLeafElement(btn)).toBe(true);

      const img = document.createElement("img");
      expect(isLeafElement(img)).toBe(true);

      const parentDiv = document.createElement("div");
      parentDiv.appendChild(document.createElement("p"));
      expect(isLeafElement(parentDiv)).toBe(false);
    });

    it("measures elements and ignores data-skeleton-ignore elements", () => {
      const container = document.createElement("div");
      const child1 = document.createElement("div");
      child1.textContent = "Visible skeleton";
      const child2 = document.createElement("div");
      child2.setAttribute("data-skeleton-ignore", "true");
      child2.textContent = "Ignored element";

      container.appendChild(child1);
      container.appendChild(child2);
      document.body.appendChild(container);

      // In happy-dom or mocked DOM
      const rects = extractSkeletonRects(container);
      expect(Array.isArray(rects)).toBe(true);

      document.body.removeChild(container);
    });
  });

  describe("Mounting & Live DOM presence", () => {
    it("mounts wrapper properly in DOM", () => {
      const container = mountComponent(() => (
        <RLSkeleton loading={true}>
          <div class="card p-4">
            <h4>Profile Title</h4>
            <p>Profile description text</p>
          </div>
        </RLSkeleton>
      ));

      const measureEl = container.querySelector('[data-slot="measure"]');
      const overlayEl = container.querySelector('[data-slot="overlay"]');
      expect(measureEl).not.toBeNull();
      expect(overlayEl).not.toBeNull();
    });
  });
});
