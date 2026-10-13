import { describe, it, expect } from "vite-plus/test";
import { renderToString } from "@solidjs/web";

import { RLMain } from "../src/components/main/RLMain";
import { renderSolid, cleanHtml } from "./utils/normalize";

describe("RLMain Solid Component Suite", () => {
  describe("Default Rendering & Structure", () => {
    it("renders a <main> element by default", () => {
      const html = renderSolid(RLMain, {}, "Page Content");

      expect(html.startsWith("<main")).toBe(true);
      expect(html.endsWith("</main>")).toBe(true);
      expect(html).toContain('data-slot="root"');
      expect(html).toContain("Page Content");
    });

    it("applies the default viewport-height theme class", () => {
      const html = renderSolid(RLMain, {}, "Themed Content");

      expect(html).toContain("min-h-[calc(100vh-var(--rl-header-height))]");
    });
  });

  describe("Polymorphic as Prop", () => {
    const customTags = ["div", "section", "article", "span", "main"] as const;

    for (const tag of customTags) {
      it(`renders root element as <${tag}> when as="${tag}"`, () => {
        const html = renderSolid(RLMain, { as: tag }, "Polymorphic Tag");

        expect(html.startsWith(`<${tag}`)).toBe(true);
        expect(html.endsWith(`</${tag}>`)).toBe(true);
        expect(html).toContain('data-slot="root"');
      });
    }

    it("keeps the theme classes when as is overridden", () => {
      const html = renderSolid(RLMain, { as: "section" }, "Section Content");

      expect(html).toContain("min-h-[calc(100vh-var(--rl-header-height))]");
    });
  });

  describe("Custom Styling & UI Overrides", () => {
    it("applies custom class to the root element while preserving base classes", () => {
      const html = renderSolid(RLMain, { class: "bg-elevated custom-main" }, "Custom Class");

      expect(html).toContain("custom-main");
      expect(html).toContain("bg-elevated");
      expect(html).toContain("min-h-[calc(100vh-var(--rl-header-height))]");
    });

    it("overrides the root slot via the ui prop", () => {
      const html = renderSolid(RLMain, { ui: { root: "border-4 border-primary" } }, "UI Override");

      expect(html).toContain("border-4");
      expect(html).toContain("border-primary");
      expect(html).toContain("min-h-[calc(100vh-var(--rl-header-height))]");
    });

    it("supports functional ui overrides receiving the resolved base classes", () => {
      const html = renderSolid(
        RLMain,
        { ui: { root: (base: string) => `${base} ring-1 ring-emerald-500` } },
        "Functional UI",
      );

      expect(html).toContain("min-h-[calc(100vh-var(--rl-header-height))]");
      expect(html).toContain("ring-1");
      expect(html).toContain("ring-emerald-500");
    });
  });

  describe("Attribute Forwarding & Rest Props Sanitization", () => {
    it("forwards standard HTML attributes, accessibility attributes, and event handlers", () => {
      const html = renderSolid(
        RLMain,
        {
          id: "app-main",
          "data-testid": "main-test",
          role: "region",
          "aria-label": "Main content",
          tabindex: "0",
        },
        "Accessible Main",
      );

      expect(html).toContain('id="app-main"');
      expect(html).toContain('data-testid="main-test"');
      expect(html).toContain('role="region"');
      expect(html).toContain('aria-label="Main content"');
      expect(html).toContain('tabindex="0"');
    });

    it("omits internal component props from being rendered as DOM attributes", () => {
      const html = renderSolid(
        RLMain,
        { as: "div", ui: { root: "custom" }, class: "my-class" },
        "Omitted Props",
      );

      expect(html).not.toContain('ui="');
      expect(html).not.toContain('as="');
      expect(html).toContain("my-class");
    });

    it("does not render a hardcoded class beyond the theme output", () => {
      const html = renderSolid(RLMain, {}, "No Extra Classes");

      expect(html).not.toContain("rl-main-container");
    });
  });

  describe("Children Rendering", () => {
    it("renders nested element children inside the root", () => {
      const html = cleanHtml(
        renderToString(() => (
          <RLMain>
            <h1 class="text-2xl">Dashboard</h1>
            <p>Welcome back.</p>
          </RLMain>
        )),
      );

      expect(html).toContain("<h1");
      expect(html).toContain("Dashboard");
      expect(html).toContain("<p");
      expect(html).toContain("Welcome back.");
    });

    it("renders without children (empty main)", () => {
      const html = renderSolid(RLMain, {});

      expect(html.startsWith("<main")).toBe(true);
      expect(html.endsWith("</main>")).toBe(true);
      expect(html).toContain('data-slot="root"');
    });
  });
});
