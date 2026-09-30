import { describe, it, expect, vi, beforeEach } from "vite-plus/test";

vi.mock("virtual:rimelight/ui", () => ({
  default: {
    unstyled: false,
    components: { themes: {} },
    icons: {}
  }
}));

import { RLBanner } from "../src/components/banner/RLBanner";
import { renderSolid } from "./utils/normalize";

describe("RLBanner Solid Component Suite", () => {
  const colors = [
    "primary",
    "secondary",
    "success",
    "info",
    "warning",
    "error",
    "neutral"
  ] as const;

  beforeEach(() => {
    try {
      if (typeof window !== "undefined") {
        window.localStorage.clear();
      }
    } catch {}
  });

  describe("Basic & Title / Content Rendering", () => {
    it("renders title prop correctly", () => {
      const html = renderSolid(RLBanner, { title: "Important Update Available" });
      expect(html).toContain("Important Update Available");
      expect(html).toContain('data-slot="root"');
      expect(html).toContain('data-slot="title"');
      expect(html).toContain('role="region"');
    });

    it("renders default children when title prop is not provided", () => {
      const html = renderSolid(RLBanner, {}, "Default children banner message");
      expect(html).toContain("Default children banner message");
      expect(html).toContain('data-slot="title"');
    });

    it("renders custom as polymorphic element", () => {
      const html = renderSolid(RLBanner, { as: "section", title: "Section Banner" });
      expect(html).toContain("<section");
      expect(html).toContain('data-slot="root"');
      expect(html).toContain("Section Banner");
    });
  });

  describe("Color Variants", () => {
    for (const color of colors) {
      it(`renders color="${color}" correctly`, () => {
        const html = renderSolid(RLBanner, { color, title: `Banner with ${color} color` });
        expect(html).toContain(`Banner with ${color} color`);
        expect(html).toContain('data-slot="root"');
      });
    }
  });

  describe("Icons & Leading Slot", () => {
    it("renders icon prop in leading slot", () => {
      const html = renderSolid(RLBanner, { icon: "rocket", title: "Launch Notification" });
      expect(html).toContain('data-slot="icon"');
      expect(html).toContain("<svg");
      expect(html).toContain("Launch Notification");
    });

    it("renders custom leading slot", () => {
      const html = renderSolid(RLBanner, {
        leading: '<span class="custom-leading">🚀 Custom</span>' as any,
        title: "Custom Leading Slot"
      });
      expect(html).toContain("custom-leading");
      expect(html).toContain("Custom Leading Slot");
    });
  });

  describe("Actions Prop & Actions Slot", () => {
    it("renders action buttons via actions prop", () => {
      const html = renderSolid(RLBanner, {
        title: "New feature released!",
        actions: [
          { label: "Learn More", href: "/docs" },
          { label: "Dismiss", variant: "outline" }
        ]
      });
      expect(html).toContain('data-slot="actions"');
      expect(html).toContain("Learn More");
      expect(html).toContain("Dismiss");
    });

    it("renders custom actions slot", () => {
      const html = renderSolid(RLBanner, {
        title: "Actions Slot Test",
        actionsSlot: '<button type="button" class="btn-custom">Click Me</button>' as any
      });
      expect(html).toContain('data-slot="actions"');
      expect(html).toContain("btn-custom");
    });
  });

  describe("Closable & Dismiss Persistence", () => {
    it("renders close button when close=true", () => {
      const html = renderSolid(RLBanner, {
        title: "Dismissible Banner",
        close: true
      });
      expect(html).toContain('data-slot="close"');
      expect(html).toContain("data-banner-close");
      expect(html).toContain('aria-label="Close banner"');
    });

    it("supports backward compatible dismissable=true prop", () => {
      const html = renderSolid(RLBanner, {
        title: "Legacy dismissable prop",
        dismissable: true
      });
      expect(html).toContain('data-slot="close"');
      expect(html).toContain("data-banner-close");
    });

    it("customizes close button with closeIcon prop", () => {
      const html = renderSolid(RLBanner, {
        title: "Custom Close Icon",
        close: true,
        closeIcon: "trash"
      });
      expect(html).toContain('data-slot="close"');
    });

    it("customizes close button with object props", () => {
      const html = renderSolid(RLBanner, {
        title: "Object Close Props",
        close: {
          variant: "outline",
          color: "error",
          ariaLabel: "Custom dismiss label"
        }
      });
      expect(html).toContain('data-slot="close"');
      expect(html).toContain('aria-label="Custom dismiss label"');
    });
  });

  describe("Link & Navigation Mode", () => {
    it("renders anchor tag when `to` prop is provided", () => {
      const html = renderSolid(RLBanner, {
        to: "https://rimelight.com",
        target: "_blank",
        title: "Visit Rimelight"
      });
      expect(html).toContain("<a");
      expect(html).toContain('href="https://rimelight.com"');
      expect(html).toContain('target="_blank"');
      expect(html).toContain('role="link"');
    });

    it("renders anchor tag when `href` prop is provided", () => {
      const html = renderSolid(RLBanner, {
        href: "/announcement",
        title: "Read announcement"
      });
      expect(html).toContain("<a");
      expect(html).toContain('href="/announcement"');
    });
  });

  describe("UI & Custom Slots Overrides", () => {
    it("applies class and ui slot overrides", () => {
      const html = renderSolid(RLBanner, {
        title: "Custom UI Classes",
        class: "my-custom-banner",
        ui: {
          root: "custom-root",
          title: "custom-title",
          container: "custom-container"
        }
      });
      expect(html).toContain("my-custom-banner");
      expect(html).toContain("custom-root");
      expect(html).toContain("custom-title");
      expect(html).toContain("custom-container");
    });
  });

  describe("Header Stack & Contain Integration", () => {
    it("includes header stack and contain attributes", () => {
      const html = renderSolid(RLBanner, {
        title: "Header Stack Banner",
        contain: true,
        stackIndex: 2,
        fixed: true
      });
      expect(html).toContain('data-rl-banner="true"');
      expect(html).toContain('data-contain="true"');
      expect(html).toContain('data-stack-index="2"');
      expect(html).toContain('data-layer-type="banner"');
    });
  });
});
