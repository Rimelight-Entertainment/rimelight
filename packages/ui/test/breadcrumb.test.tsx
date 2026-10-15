import { describe, it, expect } from "vite-plus/test";
import { renderToString } from "@solidjs/web";

import { RLBreadcrumb } from "../src/components/breadcrumb/RLBreadcrumb";
import type { BreadcrumbItem } from "../src/components/breadcrumb/breadcrumb.types";
import { renderSolid } from "./utils/normalize";

describe("RLBreadcrumb Solid Component Suite", () => {
  const standardItems: BreadcrumbItem[] = [
    { label: "Home", href: "/" },
    { label: "Components", href: "/components" },
    { label: "Breadcrumb", href: "/components/breadcrumb" },
  ];

  describe("Basic & Items Rendering", () => {
    it("renders nav root with aria-label='Breadcrumb'", () => {
      const html = renderSolid(RLBreadcrumb, { items: standardItems });
      expect(html).toContain("<nav");
      expect(html).toContain('aria-label="Breadcrumb"');
      expect(html).toContain('data-slot="root"');
      expect(html).toContain('data-slot="list"');
    });

    it("renders items with links and active last item", () => {
      const html = renderSolid(RLBreadcrumb, { items: standardItems });
      expect(html).toContain('href="/"');
      expect(html).toContain('href="/components"');
      expect(html).toContain('aria-current="page"');
      expect(html).toContain("Home");
      expect(html).toContain("Components");
      expect(html).toContain("Breadcrumb");
    });

    it("renders span instead of link when 'href' is not defined", () => {
      const items: BreadcrumbItem[] = [
        { label: "Docs", href: "/docs" },
        { label: "Static Category" },
        { label: "Current Page" },
      ];
      const html = renderSolid(RLBreadcrumb, { items });
      expect(html).toContain('href="/docs"');
      expect(html).toContain("<span");
      expect(html).toContain("Static Category");
      expect(html).toContain("Current Page");
    });

    it("supports polymorphic as prop", () => {
      const html = renderSolid(RLBreadcrumb, { as: "section", items: standardItems });
      expect(html).toContain("<section");
      expect(html).toContain('aria-label="Breadcrumb"');
    });

    it("supports custom children when items prop is omitted", () => {
      const html = renderToString(() => (
        <RLBreadcrumb>
          <li>
            <a href="/">Custom Home</a>
          </li>
          <li>
            <span aria-current="page">Custom End</span>
          </li>
        </RLBreadcrumb>
      ));
      expect(html).toContain("Custom Home");
      expect(html).toContain("Custom End");
      expect(html).toContain('data-slot="list"');
    });

    it("supports custom labelKey prop", () => {
      const customItems = [
        { title: "Dashboard", href: "/dashboard" },
        { title: "Settings", href: "/settings" },
      ];
      const html = renderSolid(RLBreadcrumb, {
        items: customItems,
        labelKey: "title",
      });
      expect(html).toContain("Dashboard");
      expect(html).toContain("Settings");
    });
  });

  describe("Icons and Avatars", () => {
    it("renders default chevronRight separator icon", () => {
      const html = renderSolid(RLBreadcrumb, { items: standardItems });
      expect(html).toContain('data-slot="separator"');
      expect(html).toContain('data-slot="separator-icon"');
    });

    it("customizes separator icon via separatorIcon prop", () => {
      const html = renderSolid(RLBreadcrumb, {
        items: standardItems,
        separatorIcon: "arrow-right",
      });
      expect(html).toContain('data-slot="separator"');
    });

    it("renders slash separator icon when configured", () => {
      const html = renderSolid(RLBreadcrumb, {
        items: standardItems,
        separatorIcon: "slash",
      });
      expect(html).toContain('data-slot="separator"');
      expect(html).toContain("i-lucide-slash");
    });

    it("renders item leading icons", () => {
      const itemsWithIcons: BreadcrumbItem[] = [
        { label: "Docs", icon: "book-open", href: "/docs" },
        { label: "Components", icon: "box", href: "/docs/components" },
        { label: "Breadcrumb", icon: "link" },
      ];
      const html = renderSolid(RLBreadcrumb, { items: itemsWithIcons });
      expect(html).toContain('data-slot="link-leading-icon"');
      expect(html).toContain("Docs");
      expect(html).toContain("Components");
      expect(html).toContain("Breadcrumb");
    });

    it("renders item leading avatar", () => {
      const itemsWithAvatar: BreadcrumbItem[] = [
        {
          label: "Team",
          avatar: { src: "https://github.com/rimelight.png", alt: "Rimelight" },
          href: "/team",
        },
        { label: "Profile" },
      ];
      const html = renderSolid(RLBreadcrumb, { items: itemsWithAvatar });
      expect(html).toContain('data-slot="link-leading-avatar"');
      expect(html).toContain('alt="Rimelight"');
      expect(html).toContain("Team");
    });
  });

  describe("Colors and Variants", () => {
    const colors = [
      "primary",
      "secondary",
      "success",
      "info",
      "warning",
      "error",
      "neutral",
    ] as const;

    for (const color of colors) {
      it(`renders color=${color} properly with auto-color classes`, () => {
        const html = renderSolid(RLBreadcrumb, { items: standardItems, color });
        expect(html).toContain(`rl-color-${color}`);
      });
    }

    it("handles disabled item state properly", () => {
      const items: BreadcrumbItem[] = [
        { label: "Home", href: "/" },
        { label: "Disabled Page", href: "/disabled", disabled: true },
        { label: "Current Page" },
      ];
      const html = renderSolid(RLBreadcrumb, { items });
      expect(html).toContain('aria-disabled="true"');
      expect(html).toContain("cursor-not-allowed");
    });
  });

  describe("Slots and Custom Templates", () => {
    it("renders separatorSlot correctly", () => {
      const html = renderToString(() => (
        <RLBreadcrumb
          items={standardItems}
          separatorSlot={() => <span class="custom-slash">/</span>}
        />
      ));
      expect(html).toContain("custom-slash");
      expect(html).toContain('data-slot="separator"');
    });

    it("renders custom item slot override via itemSlot", () => {
      const customSlotItems: BreadcrumbItem[] = [
        { label: "Home", href: "/" },
        { slot: "dropdown", label: "Menu" },
        { label: "End Page" },
      ];
      const html = renderToString(() => (
        <RLBreadcrumb
          items={customSlotItems}
          itemSlot={({ item }) =>
            item.slot === "dropdown" ? (
              <button class="dropdown-trigger">{item.label}</button>
            ) : (
              <span class="default-item">{item.label}</span>
            )
          }
        />
      ));
      expect(html).toContain("dropdown-trigger");
      expect(html).toContain("Menu");
      expect(html).toContain("Home");
      expect(html).toContain("End Page");
    });

    it("renders itemLeadingSlot and itemLabelSlot", () => {
      const html = renderToString(() => (
        <RLBreadcrumb
          items={standardItems}
          itemLeadingSlot={() => <span class="custom-bullet">•</span>}
          itemLabelSlot={({ item }) => <strong class="custom-label">{item.label}</strong>}
        />
      ));
      expect(html).toContain("custom-bullet");
      expect(html).toContain("custom-label");
      expect(html).toContain("Home");
    });
  });

  describe("Overflow and maxVisible Collapse", () => {
    const longItems: BreadcrumbItem[] = [
      { label: "Home", href: "/" },
      { label: "Level 1", href: "/1" },
      { label: "Level 2", href: "/2" },
      { label: "Level 3", href: "/3" },
      { label: "Level 4", href: "/4" },
      { label: "Current Page" },
    ];

    it("collapses intermediate items when maxVisible is set", () => {
      const html = renderSolid(RLBreadcrumb, {
        items: longItems,
        maxVisible: 3,
      });
      expect(html).toContain('data-slot="overflow"');
      expect(html).toContain("+3");
      expect(html).toContain("Home");
      expect(html).toContain("Level 4");
      expect(html).toContain("Current Page");
      expect(html).not.toContain("Level 1");
    });
  });

  describe("UI Overrides & Clean Styling", () => {
    it("applies class and ui slot overrides cleanly", () => {
      const html = renderSolid(RLBreadcrumb, {
        items: standardItems,
        class: "custom-root-breadcrumb",
        ui: {
          list: "custom-list-class",
          item: "custom-item-class",
          link: "custom-link-class",
        },
      });
      expect(html).toContain("custom-root-breadcrumb");
      expect(html).toContain("custom-list-class");
      expect(html).toContain("custom-item-class");
      expect(html).toContain("custom-link-class");
    });

    it("applies ui slot overrides exactly once (no duplicated classes)", () => {
      const html = renderSolid(RLBreadcrumb, {
        items: standardItems,
        class: "custom-root-once",
        ui: {
          root: "custom-root-slot-once",
          list: "custom-list-once",
          item: "custom-item-once",
          separator: "custom-separator-once",
        },
      });

      expect(html.match(/custom-root-once/g)?.length).toBe(1);
      expect(html.match(/custom-root-slot-once/g)?.length).toBe(1);
      expect(html.match(/custom-list-once/g)?.length).toBe(1);
      expect(html.match(/custom-item-once/g)?.length).toBe(standardItems.length);
      expect(html.match(/custom-separator-once/g)?.length).toBe(standardItems.length - 1);
    });

    it("layers per-item ui and class onto the item link", () => {
      const html = renderSolid(RLBreadcrumb, {
        items: [
          { label: "Home", href: "/", ui: { link: "item-link-cls" }, class: "item-class-cls" },
        ],
      });

      expect(html).toContain("item-link-cls");
      expect(html).toContain("item-class-cls");
      expect(html).toContain("item-link-cls item-class-cls");
    });
  });

  describe("Overflow indicator theming", () => {
    const longItems: BreadcrumbItem[] = [
      { label: "Home", href: "/" },
      { label: "Level 1", href: "/1" },
      { label: "Level 2", href: "/2" },
      { label: "Level 3", href: "/3" },
      { label: "Level 4", href: "/4" },
      { label: "Current Page" },
    ];

    it("renders ellipsis and count from theme slots", () => {
      const html = renderSolid(RLBreadcrumb, { items: longItems, maxVisible: 3 });

      expect(html).toContain('data-slot="overflow-ellipsis"');
      expect(html).toContain('data-slot="overflow-count"');
      expect(html).toContain("tracking-wider");
      expect(html).toContain("font-semibold");
      expect(html).toContain("list-none");
    });

    it("supports ui.overflow overrides", () => {
      const html = renderSolid(RLBreadcrumb, {
        items: longItems,
        maxVisible: 3,
        ui: { overflow: "custom-overflow-slot" },
      });

      expect(html).toContain("custom-overflow-slot");
    });

    it("keeps ui.item styling on items and on the overflow indicator", () => {
      const html = renderSolid(RLBreadcrumb, {
        items: longItems,
        maxVisible: 3,
        ui: { item: "custom-item-shared" },
      });

      expect((html.match(/custom-item-shared/g) ?? []).length).toBeGreaterThanOrEqual(3);
    });
  });
});
