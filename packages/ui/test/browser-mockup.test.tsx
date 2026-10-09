import { describe, it, expect } from "vite-plus/test";

import { RLBrowserMockup } from "../src/components/browser-mockup/RLBrowserMockup";
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

describe("RLBrowserMockup", () => {
  describe("Structure and Elements", () => {
    it("renders root, header, controls, and body by default", () => {
      const html = render(() => (
        <RLBrowserMockup url="https://rimelight.com">
          <div>Content inside mockup</div>
        </RLBrowserMockup>
      ));

      expect(slotTag(html, "root")).not.toBe("");
      expect(slotTag(html, "header")).not.toBe("");
      expect(slotTag(html, "controls")).not.toBe("");
      expect(slotTag(html, "body")).not.toBe("");
      expect(html).toContain("Content inside mockup");
      expect(html).toContain("https://rimelight.com");
    });

    it("renders custom 'as' root tag", () => {
      const html = render(() => (
        <RLBrowserMockup as="section">
          <div>Content</div>
        </RLBrowserMockup>
      ));

      expect(html).toMatch(/^<section/);
      expect(slotTag(html, "root")).toMatch(/^<section/);
    });

    it("has proper WAI-ARIA role and aria-label", () => {
      const html = render(() => (
        <RLBrowserMockup url="https://starter.rimelight.com">
          <div>Content</div>
        </RLBrowserMockup>
      ));

      const root = slotTag(html, "root");
      expect(attr(root, "role")).toBe("region");
      expect(attr(root, "aria-label")).toBe("Browser mockup: https://starter.rimelight.com");
    });

    it("allows custom ariaLabel prop", () => {
      const html = render(() => (
        <RLBrowserMockup ariaLabel="Custom Browser Preview">
          <div>Content</div>
        </RLBrowserMockup>
      ));

      const root = slotTag(html, "root");
      expect(attr(root, "aria-label")).toBe("Custom Browser Preview");
    });
  });

  describe("Window Controls", () => {
    it("renders three window dots (close, minimize, maximize) with color variant by default", () => {
      const html = render(() => <RLBrowserMockup />);
      expect(slotTag(html, "dot-close")).not.toBe("");
      expect(slotTag(html, "dot-minimize")).not.toBe("");
      expect(slotTag(html, "dot-maximize")).not.toBe("");
      expect(slotTag(html, "controls")).toContain('aria-hidden="true"');
    });

    it("hides controls when controls={false}", () => {
      const html = render(() => <RLBrowserMockup controls={false} />);
      expect(slotTag(html, "controls")).toBe("");
      expect(slotTag(html, "dot-close")).toBe("");
    });

    it("hides controls when controlsVariant='none'", () => {
      const html = render(() => <RLBrowserMockup controlsVariant="none" />);
      expect(slotTag(html, "controls")).toBe("");
    });

    it("supports monochrome controlsVariant", () => {
      const html = render(() => <RLBrowserMockup controlsVariant="monochrome" />);
      expect(slotTag(html, "controls")).not.toBe("");
      expect(slotTag(html, "dot-close")).toContain("bg-neutral-600");
    });

    it("supports custom controlsSlot override", () => {
      const html = render(() => (
        <RLBrowserMockup controlsSlot={<span data-slot="custom-controls">Custom Dots</span>} />
      ));
      expect(html).toContain("Custom Dots");
      expect(slotTag(html, "dot-close")).toBe("");
    });
  });

  describe("Navigation Buttons", () => {
    it("does not render navigation buttons by default", () => {
      const html = render(() => <RLBrowserMockup url="https://rimelight.com" />);
      expect(slotTag(html, "navigation")).toBe("");
      expect(slotTag(html, "nav-back")).toBe("");
    });

    it("renders back, forward, and reload buttons when navigation={true}", () => {
      const html = render(() => <RLBrowserMockup navigation url="https://rimelight.com" />);
      expect(slotTag(html, "navigation")).not.toBe("");
      expect(slotTag(html, "nav-back")).not.toBe("");
      expect(slotTag(html, "nav-forward")).not.toBe("");
      expect(slotTag(html, "nav-reload")).not.toBe("");
      expect(attr(slotTag(html, "nav-back"), "aria-label")).toBe("Back");
      expect(attr(slotTag(html, "nav-forward"), "aria-label")).toBe("Forward");
      expect(attr(slotTag(html, "nav-reload"), "aria-label")).toBe("Reload");
    });

    it("supports custom navigationSlot", () => {
      const html = render(() => (
        <RLBrowserMockup navigation navigationSlot={<div data-slot="custom-nav">Nav</div>} />
      ));
      expect(html).toContain("custom-nav");
    });
  });

  describe("URL Address Bar & Slots", () => {
    it("renders default lock icon prefix with URL", () => {
      const html = render(() => <RLBrowserMockup url="https://rimelight.com" />);
      expect(slotTag(html, "url-bar")).not.toBe("");
      expect(slotTag(html, "url-prefix")).not.toBe("");
      expect(html).toContain("https://rimelight.com");
    });

    it("allows custom urlIcon name", () => {
      const html = render(() => <RLBrowserMockup url="https://rimelight.com" urlIcon="search" />);
      expect(slotTag(html, "url-bar")).not.toBe("");
      expect(html).toContain("https://rimelight.com");
    });

    it("supports string urlPrefix", () => {
      const html = render(() => <RLBrowserMockup url="rimelight.com" urlPrefix="https://" />);
      expect(html).toContain("https://");
      expect(html).toContain("rimelight.com");
    });

    it("can hide urlPrefix via urlPrefix={false}", () => {
      const html = render(() => <RLBrowserMockup url="rimelight.com" urlPrefix={false} />);
      expect(slotTag(html, "url-prefix")).toBe("");
    });

    it("supports urlSuffixSlot and actionsSlot", () => {
      const html = render(() => (
        <RLBrowserMockup
          url="https://rimelight.com"
          urlSuffixSlot={<span data-slot="star-btn">★</span>}
          actionsSlot={
            <button type="button" data-slot="menu-btn">
              Menu
            </button>
          }
        />
      ));
      expect(slotTag(html, "url-suffix")).not.toBe("");
      expect(html).toContain("★");
      expect(slotTag(html, "actions")).not.toBe("");
      expect(html).toContain("Menu");
    });

    it("supports entire urlSlot override", () => {
      const html = render(() => (
        <RLBrowserMockup urlSlot={<div data-slot="custom-url-bar">Custom URL</div>} />
      ));
      expect(html).toContain("Custom URL");
      expect(slotTag(html, "url-bar")).toBe("");
    });

    it("supports entire headerSlot override", () => {
      const html = render(() => (
        <RLBrowserMockup headerSlot={<div data-slot="my-header">Custom Browser Header</div>}>
          <div>Body</div>
        </RLBrowserMockup>
      ));
      expect(html).toContain("Custom Browser Header");
      expect(slotTag(html, "controls")).toBe("");
      expect(html).toContain("Body");
    });
  });

  describe("Variants and Styling", () => {
    it("applies outline variant by default", () => {
      const html = render(() => <RLBrowserMockup />);
      expect(slotTag(html, "root")).toContain("border-default");
    });

    it("applies solid variant classes", () => {
      const html = render(() => <RLBrowserMockup variant="solid" />);
      expect(slotTag(html, "root")).toContain("bg-elevated/20");
    });

    it("applies soft variant classes", () => {
      const html = render(() => <RLBrowserMockup variant="soft" />);
      expect(slotTag(html, "root")).toContain("border-0");
    });

    it("applies ghost variant classes", () => {
      const html = render(() => <RLBrowserMockup variant="ghost" />);
      expect(slotTag(html, "root")).toContain("bg-transparent");
    });

    it("supports sizes sm, md, lg, xl", () => {
      const sm = render(() => <RLBrowserMockup size="sm" />);
      const xl = render(() => <RLBrowserMockup size="xl" />);
      expect(slotTag(sm, "header")).toContain("px-3");
      expect(slotTag(xl, "header")).toContain("px-6");
    });

    it("respects padded={false}", () => {
      const html = render(() => (
        <RLBrowserMockup padded={false}>
          <span>No pad</span>
        </RLBrowserMockup>
      ));
      expect(slotTag(html, "body")).toContain("p-0!");
    });

    it("respects shadow={false} and rounded={false}", () => {
      const html = render(() => <RLBrowserMockup shadow={false} rounded={false} />);
      expect(slotTag(html, "root")).toContain("shadow-none");
      expect(slotTag(html, "root")).toContain("rounded-none");
    });

    it("supports ui slot overrides", () => {
      const html = render(() => (
        <RLBrowserMockup
          url="https://test.com"
          ui={{
            root: "custom-root-class",
            header: "custom-header-class",
            body: "custom-body-class",
            urlBar: "custom-urlbar-class",
          }}
        />
      ));

      expect(slotTag(html, "root")).toContain("custom-root-class");
      expect(slotTag(html, "header")).toContain("custom-header-class");
      expect(slotTag(html, "body")).toContain("custom-body-class");
      expect(slotTag(html, "url-bar")).toContain("custom-urlbar-class");
    });
  });

  describe("Exports verification", () => {
    it("is exported by the components index", () => {
      expect((components as any).RLBrowserMockup).toBeDefined();
    });
  });
});
