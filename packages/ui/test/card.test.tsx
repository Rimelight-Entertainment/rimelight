import { describe, it, expect } from "vite-plus/test";

import { RLCard } from "../src/components/card/RLCard";
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

describe("RLCard", () => {
  const variants = ["solid", "outline", "soft", "subtle"] as const;

  describe("Exports", () => {
    it("exports RLCard component from index", () => {
      expect(RLCard).toBeDefined();
    });
  });

  describe("Structure, Slots & Props", () => {
    it("renders default card structure as div", () => {
      const html = render(() => <RLCard>Body content</RLCard>);
      expect(html).toMatch(/^<div/);
      expect(slotTag(html, "root")).not.toBe("");
      expect(slotTag(html, "body")).not.toBe("");
      expect(html).toContain("Body content");
    });

    it("does not render header, body, or footer when empty", () => {
      const html = render(() => <RLCard />);
      expect(slotTag(html, "root")).not.toBe("");
      expect(slotTag(html, "header")).toBe("");
      expect(slotTag(html, "body")).toBe("");
      expect(slotTag(html, "footer")).toBe("");
    });

    it("renders title and description in header", () => {
      const html = render(() => (
        <RLCard title="Card Title" description="Card Description">
          Body
        </RLCard>
      ));
      expect(slotTag(html, "header")).not.toBe("");
      expect(slotTag(html, "title")).not.toBe("");
      expect(slotTag(html, "description")).not.toBe("");
      expect(html).toContain("Card Title");
      expect(html).toContain("Card Description");
    });

    it("prefers titleSlot and descriptionSlot over props", () => {
      const html = render(() => (
        <RLCard
          title="Prop Title"
          description="Prop Desc"
          titleSlot={<h3>Slot Title</h3>}
          descriptionSlot={<p>Slot Desc</p>}
        />
      ));
      expect(html).toContain("Slot Title");
      expect(html).toContain("Slot Desc");
      expect(html).not.toContain("Prop Title");
      expect(html).not.toContain("Prop Desc");
    });

    it("renders header slot directly and replaces title/description", () => {
      const html = render(() => (
        <RLCard
          title="Ignored Title"
          description="Ignored Desc"
          headerSlot={<div class="custom-header">Custom Header</div>}
        >
          Body
        </RLCard>
      ));
      expect(html).toContain("Custom Header");
      expect(html).not.toContain("Ignored Title");
      expect(html).not.toContain("Ignored Desc");
    });

    it("supports headerSlot alias", () => {
      const html = render(() => (
        <RLCard headerSlot={<div class="header-alias">Header Alias</div>} />
      ));
      expect(html).toContain("Header Alias");
    });

    it("renders body via body prop or bodySlot alias", () => {
      const propHtml = render(() => <RLCard bodySlot={<span>Body Prop</span>} />);
      expect(propHtml).toContain("Body Prop");
      expect(slotTag(propHtml, "body")).not.toBe("");

      const slotHtml = render(() => <RLCard bodySlot={<span>Body Slot</span>} />);
      expect(slotHtml).toContain("Body Slot");
      expect(slotTag(slotHtml, "body")).not.toBe("");
    });

    it("renders footerSlot", () => {
      const footerHtml = render(() => (
        <RLCard footerSlot={<button type="button">Action</button>}>Content</RLCard>
      ));
      expect(slotTag(footerHtml, "footer")).not.toBe("");
      expect(footerHtml).toContain("Action");

      const footerSlotHtml = render(() => (
        <RLCard footerSlot={<button type="button">Slot Action</button>} />
      ));
      expect(slotTag(footerSlotHtml, "footer")).not.toBe("");
      expect(footerSlotHtml).toContain("Slot Action");
    });
  });

  describe("Variants", () => {
    it("renders outline variant by default", () => {
      const html = render(() => <RLCard title="Outline Default" />);
      const root = slotTag(html, "root");
      expect(root).toContain("bg-default ring ring-default divide-y divide-default");
    });

    for (const variant of variants) {
      it(`renders variant=${variant} correctly`, () => {
        const html = render(() => (
          <RLCard variant={variant} title="Title" description="Desc">
            Content
          </RLCard>
        ));
        expect(html).toContain("Title");
        expect(html).toContain("Content");
      });
    }

    it("renders solid variant with inverted styles", () => {
      const html = render(() => <RLCard variant="solid" title="Solid Title" description="Desc" />);
      const root = slotTag(html, "root");
      expect(root).toContain("bg-inverted text-inverted");
    });

    it("renders soft variant with elevated styles", () => {
      const html = render(() => <RLCard variant="soft" title="Soft Title" />);
      const root = slotTag(html, "root");
      expect(root).toContain("bg-elevated/50 divide-y divide-default");
    });

    it("renders subtle variant with ring and elevated styles", () => {
      const html = render(() => <RLCard variant="subtle" title="Subtle Title" />);
      const root = slotTag(html, "root");
      expect(root).toContain("bg-elevated/50 ring ring-default divide-y divide-default");
    });
  });

  describe("Media & Overlay", () => {
    it("renders media with mediaSrc prop", () => {
      const html = render(() => (
        <RLCard mediaSrc="https://example.com/image.jpg" title="Photo Card" />
      ));
      expect(slotTag(html, "media")).not.toBe("");
      expect(html).toContain('src="https://example.com/image.jpg"');
      expect(html).toContain('alt="Photo Card"');
    });

    it("renders custom media or mediaSlot", () => {
      const html = render(() => (
        <RLCard mediaSlot={<div class="video-player">Video</div>} title="Video Card" />
      ));
      expect(html).toContain("video-player");
      expect(html).toContain("Video");
    });

    it("renders overlay mode with title and description", () => {
      const html = render(() => (
        <RLCard
          overlay
          mediaSrc="https://example.com/bg.jpg"
          title="Overlay Title"
          description="Overlay Description"
        >
          Overlay Body
        </RLCard>
      ));
      expect(slotTag(html, "overlay")).not.toBe("");
      expect(html).toContain("Overlay Title");
      expect(html).toContain("Overlay Description");
      expect(html).toContain("Overlay Body");
      expect(slotTag(html, "root")).toContain("relative");
    });

    it("renders custom overlaySlot", () => {
      const html = render(() => (
        <RLCard
          overlaySlot={<div class="custom-overlay">Custom Overlay Content</div>}
          mediaSrc="https://example.com/bg.jpg"
        />
      ));
      expect(html).toContain("custom-overlay");
      expect(html).toContain("Custom Overlay Content");
    });
  });

  describe("Polymorphism & Links", () => {
    it("renders custom HTML element via as prop", () => {
      const sectionHtml = render(() => <RLCard as="section" title="Section Card" />);
      expect(sectionHtml).toMatch(/^<section/);

      const articleHtml = render(() => <RLCard as="article" title="Article Card" />);
      expect(articleHtml).toMatch(/^<article/);

      const asideHtml = render(() => <RLCard as="aside" title="Aside Card" />);
      expect(asideHtml).toMatch(/^<aside/);
    });

    it("automatically renders as an anchor when href is provided", () => {
      const html = render(() => <RLCard href="https://example.com" title="Link Card" />);
      expect(html).toMatch(/^<a/);
      expect(html).toContain('href="https://example.com"');
    });

    it("applies target and rel attributes for external links", () => {
      const html = render(() => (
        <RLCard href="https://example.com" target="_blank" title="External Link" />
      ));
      expect(html).toContain('target="_blank"');
      expect(html).toContain('rel="noopener noreferrer"');
    });
  });

  describe("Accessibility (WAI-ARIA)", () => {
    it("automatically links title with aria-labelledby", () => {
      const html = render(() => <RLCard id="test-card" title="My Title" />);
      const root = slotTag(html, "root");
      const title = slotTag(html, "title");
      expect(attr(root, "aria-labelledby")).toBe("test-card-title");
      expect(attr(title, "id")).toBe("test-card-title");
    });

    it("automatically links description with aria-describedby", () => {
      const html = render(() => <RLCard id="test-card" description="My Description Details" />);
      const root = slotTag(html, "root");
      const desc = slotTag(html, "description");
      expect(attr(root, "aria-describedby")).toBe("test-card-description");
      expect(attr(desc, "id")).toBe("test-card-description");
    });

    it("supports explicit ariaLabel, ariaLabelledby, ariaDescribedby, and role", () => {
      const html = render(() => (
        <RLCard
          role="region"
          ariaLabel="Card region"
          ariaLabelledby="custom-heading"
          ariaDescribedby="custom-desc"
        >
          Content
        </RLCard>
      ));
      const root = slotTag(html, "root");
      expect(attr(root, "role")).toBe("region");
      expect(attr(root, "aria-label")).toBe("Card region");
      expect(attr(root, "aria-labelledby")).toBe("custom-heading");
      expect(attr(root, "aria-describedby")).toBe("custom-desc");
    });
  });

  describe("Custom UI and Classes", () => {
    it("applies class prop to root", () => {
      const html = render(() => <RLCard class="custom-card-class" title="Test" />);
      expect(slotTag(html, "root")).toContain("custom-card-class");
    });

    it("applies ui slot class overrides", () => {
      const html = render(() => (
        <RLCard
          title="Customized"
          description="Sub-text"
          footerSlot="Footer"
          ui={{
            root: "shadow-2xl",
            header: "p-8",
            title: "font-black tracking-widest",
            description: "italic text-xs",
            body: "p-8",
            footer: "bg-elevated",
          }}
        >
          Body
        </RLCard>
      ));
      expect(slotTag(html, "root")).toContain("shadow-2xl");
      expect(slotTag(html, "header")).toContain("p-8");
      expect(slotTag(html, "title")).toContain("font-black tracking-widest");
      expect(slotTag(html, "description")).toContain("italic text-xs");
      expect(slotTag(html, "body")).toContain("p-8");
      expect(slotTag(html, "footer")).toContain("bg-elevated");
    });

    it("applies data-theme attribute", () => {
      const html = render(() => <RLCard theme="dark" title="Dark Theme" />);
      expect(attr(slotTag(html, "root"), "data-theme")).toBe("dark");
    });
  });
});
