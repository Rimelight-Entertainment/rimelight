import { describe, it, expect, afterEach } from "vite-plus/test";
import { flush } from "solid-js";
import { render } from "@solidjs/web";
import { RLSidebar } from "../src/components/sidebar/RLSidebar";
import type { SidebarItem } from "../src/components/sidebar/sidebar.types";

const disposers: Array<() => void> = [];

function mount(fn: () => any): void {
  const container = document.createElement("div");
  document.body.appendChild(container);
  disposers.push(render(fn, container));
  flush();
}

function q<T extends HTMLElement = HTMLElement>(selector: string): T | null {
  return document.querySelector<T>(selector);
}

function click(el: HTMLElement | null): void {
  el?.click();
  flush();
}

const items: SidebarItem[] = [
  { label: "Overview", href: "/overview", icon: "layers", badge: "New" },
  {
    label: "Guides",
    children: [
      { label: "Install", href: "/guides/install" },
      { label: "Theme", href: "/guides/theme", active: true },
    ],
  },
];

afterEach(() => {
  while (disposers.length) disposers.pop()?.();
  document.body.innerHTML = "";
});

describe("RLSidebar", () => {
  describe("items", () => {
    it("renders a leaf item as a link to its href", () => {
      mount(() => <RLSidebar items={[{ label: "Overview", href: "/overview" }]} />);
      const link = q<HTMLAnchorElement>('[data-slot="root"] a');
      expect(link?.getAttribute("href")).toBe("/overview");
      expect(link?.textContent).toContain("Overview");
    });

    it("falls back to # when a leaf item has no href", () => {
      mount(() => <RLSidebar items={[{ label: "Draft" }]} />);
      expect(q('[data-slot="root"] a')?.getAttribute("href")).toBe("#");
    });

    it("marks an active leaf item with data-active and aria-current", () => {
      mount(() => <RLSidebar items={[{ label: "Overview", href: "/o", active: true }]} />);
      const link = q('[data-slot="root"] a');
      expect(link?.hasAttribute("data-active")).toBe(true);
      expect(link?.getAttribute("aria-current")).toBe("page");
    });

    it("renders an item with a badge string as a badge", () => {
      mount(() => <RLSidebar items={[{ label: "Overview", href: "/o", badge: "New" }]} />);
      expect(q('[data-slot="item-badge"]')?.textContent).toContain("New");
    });

    it("renders no badge when none is given", () => {
      mount(() => <RLSidebar items={[{ label: "Overview", href: "/o" }]} />);
      expect(q('[data-slot="item-badge"]')).toBeNull();
    });

    it("renders children inside a details element", () => {
      mount(() => <RLSidebar items={items} />);
      const details = q("details");
      expect(details).not.toBeNull();
      expect(details?.querySelectorAll("a").length).toBe(2);
    });

    it("opens a parent whose child is active and keeps others closed", () => {
      mount(() => (
        <RLSidebar
          items={[
            { label: "Closed", children: [{ label: "Child", href: "/c" }] },
            { label: "Open", children: [{ label: "Active", href: "/a", active: true }] },
          ]}
        />
      ));
      const [closed, open] = Array.from(document.querySelectorAll("details"));
      expect(closed?.hasAttribute("open")).toBe(false);
      expect(open?.hasAttribute("open")).toBe(true);
    });

    it("marks a parent whose child is active as active", () => {
      mount(() => <RLSidebar items={items} />);
      expect(q("summary")?.hasAttribute("data-active")).toBe(true);
    });

    it("renders no items when the items prop is omitted", () => {
      mount(() => <RLSidebar />);
      expect(q('[data-slot="item"]')).toBeNull();
    });
  });

  describe("slots", () => {
    it("renders children in place of the item list", () => {
      mount(() => (
        <RLSidebar items={[{ label: "Hidden", href: "/h" }]}>
          <span data-test="custom-nav">Custom nav</span>
        </RLSidebar>
      ));
      expect(q('[data-test="custom-nav"]')).not.toBeNull();
      expect(q('[data-slot="item"]')).toBeNull();
    });

    it("renders headerSlot in place of the logo", () => {
      mount(() => (
        <RLSidebar logo="Brand" headerSlot={<span data-test="custom-header">Header</span>} />
      ));
      expect(q('[data-test="custom-header"]')).not.toBeNull();
      expect(q('[data-slot="logo-wrapper"]')).toBeNull();
    });

    it("renders the logo when no headerSlot is given", () => {
      mount(() => <RLSidebar logo="Brand" />);
      expect(q('[data-slot="logo-wrapper"]')?.textContent).toContain("Brand");
    });

    it("renders no footer when footerSlot is omitted", () => {
      mount(() => <RLSidebar />);
      expect(q('[data-slot="footer"]')).toBeNull();
    });

    it("renders footerSlot inside the footer", () => {
      mount(() => <RLSidebar footerSlot={<span data-test="custom-footer">Footer</span>} />);
      expect(q('[data-slot="footer"] [data-test="custom-footer"]')).not.toBeNull();
    });
  });

  describe("collapsible", () => {
    it("renders no toggle button when collapsible is none", () => {
      mount(() => <RLSidebar collapsible="none" />);
      expect(q("[data-sidebar-toggle]")).toBeNull();
    });

    it("renders no toggle button in icon mode", () => {
      mount(() => <RLSidebar collapsible="icon" />);
      expect(q("[data-sidebar-toggle]")).toBeNull();
    });

    it("toggles the offcanvas root open and closed from the toggle button", () => {
      mount(() => <RLSidebar collapsible="offcanvas" />);
      const root = q('[data-slot="root"]');
      const toggle = q<HTMLButtonElement>("[data-sidebar-toggle]");

      expect(root?.hasAttribute("data-open")).toBe(false);
      expect(toggle?.getAttribute("aria-expanded")).toBe("false");

      click(toggle);
      expect(root?.hasAttribute("data-open")).toBe(true);
      expect(toggle?.getAttribute("aria-expanded")).toBe("true");

      click(toggle);
      expect(root?.hasAttribute("data-open")).toBe(false);
      expect(toggle?.getAttribute("aria-expanded")).toBe("false");
    });
  });

  describe("root", () => {
    it("marks the root with data-slot, data-theme, and data-sidebar", () => {
      mount(() => <RLSidebar theme="dark" />);
      const root = q('[data-slot="root"]');
      expect(root?.tagName).toBe("ASIDE");
      expect(root?.hasAttribute("data-sidebar")).toBe(true);
      expect(root?.hasAttribute("data-theme")).toBe(true);
    });
  });
});
