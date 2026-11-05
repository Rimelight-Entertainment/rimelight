import { describe, it, expect } from "vite-plus/test";

import { RLCallout } from "../src/components/callout/RLCallout";
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

describe("RLCallout", () => {
  const colors = [
    "primary",
    "secondary",
    "success",
    "info",
    "warning",
    "error",
    "neutral",
  ] as const;

  describe("Exports", () => {
    it("exports RLCallout component from index", () => {
      expect(RLCallout).toBeDefined();
    });
  });

  describe("Title, Description & Content", () => {
    it("renders the title prop", () => {
      const html = render(() => <RLCallout title="Heads up!" />);
      expect(html).toContain("Heads up!");
      expect(slotTag(html, "title")).not.toBe("");
    });

    it("renders the description prop", () => {
      const html = render(() => <RLCallout description="System maintenance tonight." />);
      expect(html).toContain("System maintenance tonight.");
      expect(slotTag(html, "description")).not.toBe("");
    });

    it("renders children as description content", () => {
      const html = render(() => <RLCallout>Children description message</RLCallout>);
      expect(html).toContain("Children description message");
      expect(slotTag(html, "description")).not.toBe("");
    });

    it("renders both title and description together", () => {
      const html = render(() => (
        <RLCallout title="Update Available" description="Version 2.0 is now live." />
      ));
      expect(html).toContain("Update Available");
      expect(html).toContain("Version 2.0 is now live.");
      expect(slotTag(html, "title")).not.toBe("");
      expect(slotTag(html, "description")).not.toBe("");
    });

    it("prefers titleSlot over title prop", () => {
      const html = render(() => (
        <RLCallout title="Old Title" titleSlot={<span>Custom Title Slot</span>} />
      ));
      expect(html).toContain("Custom Title Slot");
      expect(html).not.toContain("Old Title");
    });

    it("prefers descriptionSlot over description prop", () => {
      const html = render(() => (
        <RLCallout
          description="Old Description"
          descriptionSlot={<span>Custom Description Slot</span>}
        />
      ));
      expect(html).toContain("Custom Description Slot");
      expect(html).not.toContain("Old Description");
    });

    it("renders headerSlot inside wrapper", () => {
      const html = render(() => <RLCallout headerSlot={<span class="badge">Extra Header</span>} />);
      expect(html).toContain("Extra Header");
    });

    it("renders as a div by default and honours `as` prop", () => {
      expect(render(() => <RLCallout title="Alert" />)).toMatch(/^<div/);
      expect(render(() => <RLCallout as="section" title="Alert" />)).toMatch(/^<section/);
      expect(render(() => <RLCallout as="aside" title="Alert" />)).toMatch(/^<aside/);
    });
  });

  describe("Colors", () => {
    for (const color of colors) {
      it(`applies rl-color-${color} class`, () => {
        const html = render(() => <RLCallout color={color} title="Notice" />);
        const root = slotTag(html, "root");
        expect(root).toContain(`rl-color-${color}`);
      });
    }

    it("defaults to primary color", () => {
      const html = render(() => <RLCallout title="Default color" />);
      const root = slotTag(html, "root");
      expect(root).toContain("rl-color-primary");
    });

    it("applies neutral compound variant classes", () => {
      const solidHtml = render(() => <RLCallout color="neutral" variant="solid" title="N" />);
      expect(slotTag(solidHtml, "root")).toContain("text-default bg-inverted");

      const outlineHtml = render(() => <RLCallout color="neutral" variant="outline" title="N" />);
      expect(slotTag(outlineHtml, "root")).toContain("ring-default");

      const softHtml = render(() => <RLCallout color="neutral" variant="soft" title="N" />);
      expect(slotTag(softHtml, "root")).toContain("bg-elevated/50");

      const subtleHtml = render(() => <RLCallout color="neutral" variant="subtle" title="N" />);
      expect(slotTag(subtleHtml, "root")).toContain("ring-accented");
    });
  });

  describe("Variants", () => {
    it("renders solid variant by default", () => {
      const html = render(() => <RLCallout title="Solid" />);
      expect(slotTag(html, "root")).toContain("bg-[var(--rl-bg)] text-inverted");
    });

    it("renders outline variant", () => {
      const html = render(() => <RLCallout variant="outline" title="Outline" />);
      expect(slotTag(html, "root")).toContain("ring ring-inset ring-[var(--rl-border)]/25");
    });

    it("renders soft variant", () => {
      const html = render(() => <RLCallout variant="soft" title="Soft" />);
      expect(slotTag(html, "root")).toContain("bg-[var(--rl-bg)]/10 text-[var(--rl-text)]");
    });

    it("renders subtle variant", () => {
      const html = render(() => <RLCallout variant="subtle" title="Subtle" />);
      expect(slotTag(html, "root")).toContain("bg-[var(--rl-bg)]/10 text-[var(--rl-text)]");
      expect(slotTag(html, "root")).toContain("ring ring-inset ring-[var(--rl-border)]/25");
    });
  });

  describe("Orientation", () => {
    it("defaults to vertical orientation", () => {
      const html = render(() => <RLCallout title="Notice" actions={[{ label: "Action" }]} />);
      const root = slotTag(html, "root");
      expect(attr(root, "data-orientation")).toBe("vertical");
      expect(root).toContain("items-start");
    });

    it("supports horizontal orientation", () => {
      const html = render(() => (
        <RLCallout orientation="horizontal" title="Notice" actions={[{ label: "Action" }]} />
      ));
      const root = slotTag(html, "root");
      expect(attr(root, "data-orientation")).toBe("horizontal");
      expect(root).toContain("items-center");
    });
  });

  describe("Icon, Avatar & Leading Slots", () => {
    it("renders an icon when icon prop is provided", () => {
      const html = render(() => <RLCallout icon="star" title="Favorite" />);
      const icon = slotTag(html, "icon");
      expect(icon).not.toBe("");
      expect(attr(icon, "aria-hidden")).toBe("true");
      expect(html).toContain("i-lucide-star");
    });

    it("renders an avatar when avatar src string is provided", () => {
      const html = render(() => <RLCallout avatar="https://example.com/photo.png" title="User" />);
      const avatar = slotTag(html, "avatar");
      expect(avatar).not.toBe("");
      expect(html).toContain('src="https://example.com/photo.png"');
    });

    it("renders an avatar when avatar object is provided", () => {
      const html = render(() => (
        <RLCallout
          avatar={{ src: "https://example.com/photo.png", alt: "John Doe" }}
          title="User"
        />
      ));
      const avatar = slotTag(html, "avatar");
      expect(avatar).not.toBe("");
      expect(html).toContain('alt="John Doe"');
    });

    it("iconSlot replaces icon and avatar", () => {
      const html = render(() => (
        <RLCallout
          icon="star"
          avatar="https://example.com/photo.png"
          iconSlot={<span class="custom-badge">VIP</span>}
          title="User"
        />
      ));
      expect(html).toContain("custom-badge");
      expect(slotTag(html, "icon")).toBe("");
      expect(slotTag(html, "avatar")).toBe("");
    });

    it("iconSlot alias works", () => {
      const html = render(() => (
        <RLCallout iconSlot={<span class="icon-slot">✨</span>} title="Slot" />
      ));
      expect(html).toContain("icon-slot");
    });

    it("avatarSlot works", () => {
      const html = render(() => (
        <RLCallout avatarSlot={<span class="avatar-slot">Avatar</span>} title="Slot" />
      ));
      expect(html).toContain("avatar-slot");
    });
  });

  describe("Actions", () => {
    it("renders action buttons in vertical orientation inside wrapper", () => {
      const html = render(() => (
        <RLCallout
          orientation="vertical"
          title="Attention"
          actions={[{ label: "Accept" }, { label: "Decline", variant: "subtle" }]}
        />
      ));
      expect(html).toContain("Accept");
      expect(html).toContain("Decline");
      expect(slotTag(html, "actions")).not.toBe("");
    });

    it("renders action buttons in horizontal orientation in trailing container", () => {
      const html = render(() => (
        <RLCallout
          orientation="horizontal"
          title="Attention"
          actions={[{ label: "Accept" }, { label: "Decline" }]}
        />
      ));
      expect(html).toContain("Accept");
      expect(html).toContain("Decline");
      expect(slotTag(html, "actions")).not.toBe("");
    });

    it("actionsSlot replaces action buttons", () => {
      const html = render(() => (
        <RLCallout
          actions={[{ label: "Ignored" }]}
          actionsSlot={<button type="button">Custom Action</button>}
          title="Attention"
        />
      ));
      expect(html).toContain("Custom Action");
      expect(html).not.toContain("Ignored");
    });
  });

  describe("Close Button & Dismissal", () => {
    it("renders close button when dismissible", () => {
      const html = render(() => <RLCallout title="Dismissible" dismissible />);
      const close = slotTag(html, "close");
      expect(close).not.toBe("");
      expect(attr(close, "aria-label")).toBeTruthy();
    });

    it("customizes close button icon with closeIcon prop", () => {
      const html = render(() => (
        <RLCallout title="Dismissible" dismissible closeIcon="arrow-right" />
      ));
      expect(html).toContain("i-lucide-arrow-right");
    });

    it("closeSlot replaces close button", () => {
      const html = render(() => (
        <RLCallout title="Dismissible" closeSlot={<span class="my-close">X</span>} />
      ));
      expect(html).toContain("my-close");
    });

    it("respects controlled open prop", () => {
      const openHtml = render(() => <RLCallout open={true} title="Visible" />);
      expect(openHtml).toContain("Visible");

      const closedHtml = render(() => <RLCallout open={false} title="Hidden" />);
      expect(closedHtml).toBe("");
    });
  });

  describe("Accessibility (WAI-ARIA)", () => {
    it("has role='alert'", () => {
      const html = render(() => <RLCallout title="Notice" />);
      expect(attr(slotTag(html, "root"), "role")).toBe("alert");
    });

    it("links title with aria-labelledby automatically", () => {
      const html = render(() => <RLCallout id="test-alert" title="Important Title" />);
      const root = slotTag(html, "root");
      const title = slotTag(html, "title");
      expect(attr(root, "aria-labelledby")).toBe("test-alert-title");
      expect(attr(title, "id")).toBe("test-alert-title");
    });

    it("links description with aria-describedby automatically", () => {
      const html = render(() => (
        <RLCallout id="test-alert" description="Detailed description message." />
      ));
      const root = slotTag(html, "root");
      const desc = slotTag(html, "description");
      expect(attr(root, "aria-describedby")).toBe("test-alert-description");
      expect(attr(desc, "id")).toBe("test-alert-description");
    });

    it("falls back to aria-label when no title is provided", () => {
      const html = render(() => <RLCallout aria-label="Global notice" />);
      const root = slotTag(html, "root");
      expect(attr(root, "aria-label")).toBe("Global notice");
      expect(attr(root, "aria-labelledby")).toBeUndefined();
    });

    it("allows custom aria-labelledby and aria-describedby overrides", () => {
      const html = render(() => (
        <RLCallout aria-labelledby="external-heading" aria-describedby="external-desc" />
      ));
      const root = slotTag(html, "root");
      expect(attr(root, "aria-labelledby")).toBe("external-heading");
      expect(attr(root, "aria-describedby")).toBe("external-desc");
    });
  });

  describe("Custom UI and Classes", () => {
    it("applies class prop to root", () => {
      const html = render(() => <RLCallout class="custom-root-class" title="Test" />);
      expect(slotTag(html, "root")).toContain("custom-root-class");
    });

    it("applies ui slot overrides", () => {
      const html = render(() => (
        <RLCallout
          title="Customized"
          description="Sub-text"
          icon="star"
          dismissible
          ui={{
            root: "shadow-2xl",
            title: "tracking-wide font-black",
            description: "italic",
            icon: "size-8",
            close: "opacity-50",
          }}
        />
      ));
      expect(slotTag(html, "root")).toContain("shadow-2xl");
      expect(slotTag(html, "title")).toContain("tracking-wide font-black");
      expect(slotTag(html, "description")).toContain("italic");
      expect(slotTag(html, "icon")).toContain("size-8");
      expect(slotTag(html, "close")).toContain("opacity-50");
    });

    it("applies data-theme attribute", () => {
      const html = render(() => <RLCallout theme="dark" title="Dark Theme" />);
      expect(attr(slotTag(html, "root"), "data-theme")).toBe("dark");
    });
  });
});
