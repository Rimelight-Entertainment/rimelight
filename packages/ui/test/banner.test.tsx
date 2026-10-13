import { describe, it, expect, beforeEach, afterEach } from "vite-plus/test";

import { RLBanner } from "../src/components/banner/RLBanner";
import { RLHeader } from "../src/components/header/RLHeader";
import { RLBannerTheme } from "../src/components/banner/banner.theme";
import * as components from "../src/components/index";
import { renderToString } from "@solidjs/web";
import { cleanHtml } from "./utils/normalize";

function render(fn: () => any): string {
  return cleanHtml(renderToString(fn));
}

/** Returns the opening tag of the first element carrying `data-slot="<slot>"`. */
function slotTag(html: string, slot: string): string {
  const match = html.match(new RegExp(`<[a-z]+[^>]*data-slot="${slot}"[^>]*>`));
  return match?.[0] ?? "";
}

function attr(tag: string, name: string): string | undefined {
  return tag.match(new RegExp(`\\s${name}="([^"]*)"`))?.[1];
}

describe("RLBanner", () => {
  const colors = [
    "primary",
    "secondary",
    "success",
    "info",
    "warning",
    "error",
    "neutral",
  ] as const;

  describe("Title & content", () => {
    it("renders the title prop", () => {
      const html = render(() => <RLBanner title="Important Update Available" />);
      expect(html).toContain("Important Update Available");
      expect(slotTag(html, "title")).not.toBe("");
    });

    it("falls back to children when no title is given", () => {
      const html = render(() => <RLBanner>Default children banner message</RLBanner>);
      expect(html).toContain("Default children banner message");
      expect(slotTag(html, "title")).not.toBe("");
    });

    it("prefers title over children", () => {
      const html = render(() => <RLBanner title="From prop">From children</RLBanner>);
      expect(html).toContain("From prop");
      expect(html).not.toContain("From children");
    });

    it("omits the title element when there is nothing to show", () => {
      const html = render(() => <RLBanner />);
      expect(slotTag(html, "title")).toBe("");
    });

    it("renders as a div by default and honours `as`", () => {
      expect(render(() => <RLBanner title="x" />)).toMatch(/^<div/);
      expect(render(() => <RLBanner as="section" title="x" />)).toMatch(/^<section/);
    });

    it("renders as a div even with `to` (link is an overlay, not the root)", () => {
      expect(render(() => <RLBanner to="/a" title="x" />)).toMatch(/^<div/);
    });
  });

  describe("Colors", () => {
    for (const color of colors) {
      it(`applies color="${color}"`, () => {
        const html = render(() => <RLBanner color={color} title="t" />);
        expect(attr(slotTag(html, "root"), "data-color")).toBe(color);
      });
    }

    it("defaults to primary", () => {
      const html = render(() => <RLBanner title="t" />);
      expect(attr(slotTag(html, "root"), "data-color")).toBe("primary");
    });
  });

  describe("Icon & leading slot", () => {
    it("renders the icon, hidden from assistive tech", () => {
      const html = render(() => <RLBanner icon="rocket" title="Launch" />);
      const icon = slotTag(html, "icon");
      expect(icon).not.toBe("");
      expect(attr(icon, "aria-hidden")).toBe("true");
      expect(html).toContain("<svg");
    });

    it("leading slot replaces the icon", () => {
      const html = render(() => (
        <RLBanner icon="rocket" leading={<span class="custom-leading">L</span>} title="t" />
      ));
      expect(html).toContain("custom-leading");
      expect(slotTag(html, "icon")).toBe("");
    });
  });

  describe("Title slot", () => {
    it("titleSlot replaces the title text but keeps the labelled wrapper", () => {
      const html = render(() => (
        <RLBanner title="Prop title" titleSlot={<strong class="custom-title">Slot title</strong>} />
      ));
      expect(html).toContain("custom-title");
      expect(html).not.toContain("Prop title");
      expect(attr(slotTag(html, "title"), "id")).toBeTruthy();
    });
  });

  describe("Actions", () => {
    it("renders action buttons inside the right area next to close", () => {
      const html = render(() => (
        <RLBanner
          title="t"
          actions={[
            { label: "Learn More", href: "/docs" },
            { label: "Other", variant: "outline" },
          ]}
        />
      ));
      expect(slotTag(html, "actions")).not.toBe("");
      expect(html).toContain("Learn More");
      expect(html).toContain("Other");
      const right = html.indexOf('data-slot="right"');
      const actions = html.indexOf('data-slot="actions"');
      expect(actions).toBeGreaterThan(right);
    });

    it("omits the actions wrapper for an empty array", () => {
      const html = render(() => <RLBanner title="t" actions={[]} />);
      expect(slotTag(html, "actions")).toBe("");
    });

    it("actionsSlot replaces the actions prop (Nuxt slot semantics)", () => {
      const html = render(() => (
        <RLBanner
          title="t"
          actions={[{ label: "From prop" }]}
          actionsSlot={
            <button type="button" class="btn-custom">
              Slot
            </button>
          }
        />
      ));
      expect(html).toContain("btn-custom");
      expect(html).not.toContain("From prop");
    });
  });

  describe("Close button", () => {
    it("is hidden by default", () => {
      expect(render(() => <RLBanner title="t" />)).not.toContain("data-banner-close");
    });

    it("renders an accessible type=button when close=true", () => {
      const html = render(() => <RLBanner title="t" close={true} />);
      const btn = slotTag(html, "close");
      expect(btn).not.toBe("");
      expect(btn).toContain("data-banner-close");
      expect(attr(btn, "type")).toBe("button");
      expect(attr(btn, "aria-label")).toBe("Close banner");
    });

    it("supports legacy dismissable", () => {
      expect(render(() => <RLBanner title="t" dismissable={true} />)).toContain(
        "data-banner-close",
      );
    });

    it("close=false wins over dismissable", () => {
      expect(render(() => <RLBanner title="t" close={false} dismissable={true} />)).not.toContain(
        "data-banner-close",
      );
    });

    it("merges object close props", () => {
      const html = render(() => (
        <RLBanner title="t" close={{ color: "error", ariaLabel: "Dismiss announcement" }} />
      ));
      expect(attr(slotTag(html, "close"), "aria-label")).toBe("Dismiss announcement");
    });

    it("accepts a closeIcon", () => {
      const html = render(() => <RLBanner title="t" close={true} closeIcon="x" />);
      expect(slotTag(html, "close")).not.toBe("");
    });

    it("closeSlot replaces the close button", () => {
      const html = render(() => (
        <RLBanner title="t" close={true} closeSlot={<span class="custom-close">C</span>} />
      ));
      expect(html).toContain("custom-close");
      expect(html).not.toContain("data-banner-close");
    });
  });

  describe("Rimelight extra slots", () => {
    it("renders left and right content", () => {
      const html = render(() => (
        <RLBanner
          title="t"
          left={<span class="l-extra">L</span>}
          right={<span class="r-extra">R</span>}
        />
      ));
      expect(html).toContain("l-extra");
      expect(html).toContain("r-extra");
    });

    it("center replaces leading and title", () => {
      const html = render(() => (
        <RLBanner title="Hidden title" icon="rocket" center={<span class="c-extra">C</span>} />
      ));
      expect(html).toContain("c-extra");
      expect(html).not.toContain("Hidden title");
      expect(slotTag(html, "icon")).toBe("");
    });
  });

  describe("Link mode", () => {
    it("renders an overlay link with resolved external attributes", () => {
      const html = render(() => <RLBanner to="https://rimelight.com" title="Visit" />);
      const link = slotTag(html, "link");
      expect(link).toMatch(/^<a/);
      expect(attr(link, "href")).toBe("https://rimelight.com");
      expect(attr(link, "target")).toBe("_blank");
      expect(attr(link, "rel")).toBe("noopener noreferrer");
    });

    it("accepts href as an alias of to", () => {
      const html = render(() => <RLBanner href="/announcement" title="Read" />);
      expect(attr(slotTag(html, "link"), "href")).toBe("/announcement");
    });

    it("never nests interactive content inside the anchor", () => {
      const html = render(() => (
        <RLBanner to="/x" title="t" actions={[{ label: "Act" }]} close={true} />
      ));
      expect(html).toMatch(/<a[^>]*data-slot="link"[^>]*><\/a>/);
    });

    it("labels the link by the title", () => {
      const html = render(() => <RLBanner to="/x" title="Link title" />);
      const titleId = attr(slotTag(html, "title"), "id");
      expect(attr(slotTag(html, "link"), "aria-labelledby")).toBe(titleId);
    });

    it("uses ariaLabel on the link when provided", () => {
      const html = render(() => <RLBanner to="/x" title="t" ariaLabel="Open news" />);
      const link = slotTag(html, "link");
      expect(attr(link, "aria-label")).toBe("Open news");
      expect(attr(link, "aria-labelledby")).toBeUndefined();
    });

    it("does not leak resolver internals as DOM attributes", () => {
      const html = render(() => <RLBanner to="https://a.com" title="t" />);
      expect(html).not.toMatch(/isExternal|showTrailingIcon|ariaDisabled/);
    });

    it("does not render a link without to/href", () => {
      expect(
        slotTag(
          render(() => <RLBanner title="t" />),
          "link",
        ),
      ).toBe("");
    });

    it("does not use role=link on the root", () => {
      const html = render(() => <RLBanner to="/x" title="t" />);
      expect(attr(slotTag(html, "root"), "role")).toBe("region");
    });
  });

  describe("Accessibility", () => {
    it("region is labelled by the title element", () => {
      const html = render(() => <RLBanner title="Labelled" />);
      const root = slotTag(html, "root");
      const titleId = attr(slotTag(html, "title"), "id");
      expect(attr(root, "role")).toBe("region");
      expect(titleId).toBeTruthy();
      expect(attr(root, "aria-labelledby")).toBe(titleId);
    });

    it("JSX titles are labelled too", () => {
      const html = render(() => <RLBanner titleSlot={<em>JSX</em>} />);
      expect(attr(slotTag(html, "root"), "aria-labelledby")).toBeTruthy();
    });

    it("falls back to ariaLabel when untitled", () => {
      const html = render(() => <RLBanner ariaLabel="Announcement" />);
      const root = slotTag(html, "root");
      expect(attr(root, "role")).toBe("region");
      expect(attr(root, "aria-label")).toBe("Announcement");
    });

    it("drops the region role when no accessible name exists", () => {
      const html = render(() => <RLBanner />);
      expect(attr(slotTag(html, "root"), "role")).toBeUndefined();
    });

    it("generates unique ids for multiple untitled-id banners", () => {
      const html = render(() => (
        <>
          <RLBanner title="a" />
          <RLBanner title="b" />
        </>
      ));
      const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
      expect(ids.length).toBeGreaterThanOrEqual(4);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it("uses the explicit id for the root", () => {
      const html = render(() => <RLBanner id="promo" title="t" />);
      expect(attr(slotTag(html, "root"), "id")).toBe("promo");
      expect(attr(slotTag(html, "title"), "id")).toBe("promo-title");
    });
  });

  describe("Persistence & hydration safety", () => {
    const originalWindow = (globalThis as { window?: unknown }).window;

    beforeEach(() => {
      const store = new Map<string, string>([["banner-dismissed-one", "true"]]);
      (globalThis as { window?: unknown }).window = {
        localStorage: {
          getItem: (k: string) => store.get(k) ?? null,
          setItem: (k: string, v: string) => store.set(k, v),
          removeItem: (k: string) => store.delete(k),
          clear: () => store.clear(),
        },
      };
    });

    afterEach(() => {
      (globalThis as { window?: unknown }).window = originalWindow;
    });

    it("still SSR-renders a previously dismissed banner (no initial-render divergence)", () => {
      const html = render(() => <RLBanner id="dismissed-one" title="Still here" close={true} />);
      expect(html).toContain("Still here");
    });

    it("exposes the dismiss key matching the head script", () => {
      const html = render(() => <RLBanner id="promo" title="t" close={true} />);
      expect(attr(slotTag(html, "root"), "data-dismiss-key")).toBe("banner-promo");
    });

    it("supports legacy dismissId", () => {
      const html = render(() => <RLBanner dismissId="legacy" title="t" />);
      expect(attr(slotTag(html, "root"), "data-dismiss-key")).toBe("banner-legacy");
    });

    it("has no dismiss key without an id", () => {
      const html = render(() => <RLBanner title="t" close={true} />);
      expect(attr(slotTag(html, "root"), "data-dismiss-key")).toBeUndefined();
    });
  });

  describe("CSP / styling rules", () => {
    for (const mode of [
      {},
      { sticky: true },
      { fixed: true },
      { fixed: true, hideOnScroll: true },
    ]) {
      it(`renders no inline style attribute (${JSON.stringify(mode)})`, () => {
        const html = render(() => <RLBanner title="t" {...mode} />);
        expect(html).not.toMatch(/\sstyle="/);
      });
    }

    it("applies class and ui overrides", () => {
      const html = render(() => (
        <RLBanner
          title="t"
          class="my-custom-banner"
          ui={{ root: "custom-root", title: "custom-title", container: "custom-container" }}
        />
      ));
      expect(html).toContain("my-custom-banner");
      expect(html).toContain("custom-root");
      expect(html).toContain("custom-title");
      expect(html).toContain("custom-container");
    });

    it("theme exposes all Nuxt UI slots plus extras", () => {
      const slots = RLBannerTheme({});
      for (const key of [
        "root",
        "container",
        "left",
        "center",
        "right",
        "icon",
        "title",
        "actions",
        "close",
        "link",
        "content",
      ]) {
        expect(slots).toHaveProperty(key);
      }
    });
  });

  describe("Header stack integration", () => {
    it("emits header stack data attributes", () => {
      const html = render(() => (
        <RLBanner title="t" stackIndex={2} fixed={true} hideOnScroll={true} />
      ));
      const root = slotTag(html, "root");
      expect(attr(root, "data-rl-banner")).toBe("true");
      expect(attr(root, "data-contain")).toBe("true");
      expect(attr(root, "data-stack-index")).toBe("2");
      expect(attr(root, "data-layer-type")).toBe("banner");
      expect(attr(root, "data-hide-on-scroll")).toBe("true");
      expect(attr(root, "data-collapsed")).toBe("false");
      expect(html).toContain("data-header-content");
    });

    it("contain=false is reflected", () => {
      const html = render(() => <RLBanner title="t" contain={false} />);
      expect(attr(slotTag(html, "root"), "data-contain")).toBe("false");
    });
  });
});

describe("RLHeader (shared header-stack fixes)", () => {
  it("renders no inline style attribute when sticky/fixed", () => {
    for (const mode of [{ sticky: true }, { fixed: true }, { fixed: true, hideOnScroll: true }]) {
      expect(render(() => <RLHeader {...mode}>x</RLHeader>)).not.toMatch(/\sstyle="/);
    }
  });

  it("exposes data-collapsed for theme-driven collapse", () => {
    expect(render(() => <RLHeader hideOnScroll={true}>x</RLHeader>)).toContain(
      'data-collapsed="false"',
    );
  });
});

describe("Exports", () => {
  it("exports RLBanner once, without aliases", () => {
    expect(components).toHaveProperty("RLBanner");
    expect(components).toHaveProperty("useHeaderStack");
    expect(components).not.toHaveProperty("getHeaderStack");
  });
});
