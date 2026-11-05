import { describe, it, expect } from "vite-plus/test";
import { renderToString } from "@solidjs/web";

import { RLBreadcrumb } from "../src/components/breadcrumb/RLBreadcrumb";
import type { BreadcrumbItem } from "../src/components/breadcrumb/breadcrumb.types";
import { cleanHtml } from "./utils/normalize";

function render(fn: () => any): string {
  return cleanHtml(renderToString(fn));
}

function count(html: string, pattern: RegExp): number {
  return html.match(pattern)?.length ?? 0;
}

const items: BreadcrumbItem[] = [
  { label: "Home", href: "/" },
  { label: "Docs", href: "/docs" },
  { label: "Components", href: "/docs/components" },
  { label: "Breadcrumb" },
];

describe("RLBreadcrumb", () => {
  describe("Items and links", () => {
    it("renders one list item per entry", () => {
      const html = render(() => <RLBreadcrumb items={items} />);
      expect(count(html, /<li\b[^>]*data-slot="item"/g)).toBe(4);
    });

    it("renders links for items with href", () => {
      const html = render(() => <RLBreadcrumb items={items} />);
      expect(count(html, /<a\b[^>]*data-slot="link"/g)).toBe(3);
      expect(html).toContain('href="/docs"');
    });

    it("renders items without href as non-link elements", () => {
      const html = render(() => <RLBreadcrumb items={[{ label: "Only" }]} />);
      expect(html).not.toContain("<a");
      expect(html).toContain('data-slot="link"');
    });

    it("marks the last item as the current page by default", () => {
      const html = render(() => <RLBreadcrumb items={items} />);
      expect(count(html, /aria-current="page"/g)).toBe(1);
    });

    it("honors an explicit active flag alongside the last-item default", () => {
      const html = render(() => (
        <RLBreadcrumb items={[{ label: "A", href: "/a", active: true }, { label: "B" }]} />
      ));
      expect(count(html, /aria-current="page"/g)).toBe(2);
      expect(html.indexOf('aria-current="page"')).toBeLessThan(html.indexOf(">B<"));
    });

    it("renders separators between items but not after the last", () => {
      const html = render(() => <RLBreadcrumb items={items} />);
      expect(count(html, /data-slot="separator"/g)).toBe(3);
    });

    it("reads the label from the labelKey property", () => {
      const html = render(() => (
        <RLBreadcrumb
          labelKey="name"
          items={[{ label: "ignored", name: "Shown" } as BreadcrumbItem]}
        />
      ));
      expect(html).toContain("Shown");
      expect(html).not.toContain("ignored");
    });

    it("renders children in place of items when items is omitted", () => {
      const html = render(() => (
        <RLBreadcrumb>
          <li data-custom="yes">Custom</li>
        </RLBreadcrumb>
      ));
      expect(html).toContain('data-custom="yes"');
      expect(count(html, /data-slot="item"/g)).toBe(0);
    });

    it("renders the root as the provided polymorphic tag", () => {
      const html = render(() => <RLBreadcrumb as="div" items={items} />);
      expect(html.startsWith("<div")).toBe(true);
    });

    it("renders a button for items with onSelect and no href", () => {
      const html = render(() => (
        <RLBreadcrumb items={[{ label: "Pick", onSelect: () => {} }, { label: "Last" }]} />
      ));
      expect(html).toContain("<button");
    });
  });

  describe("Overflow", () => {
    const many: BreadcrumbItem[] = [
      { label: "1", href: "/1" },
      { label: "2", href: "/2" },
      { label: "3", href: "/3" },
      { label: "4", href: "/4" },
      { label: "5", href: "/5" },
      { label: "6" },
    ];

    it("collapses middle items beyond maxVisible into an overflow indicator", () => {
      const html = render(() => <RLBreadcrumb items={many} maxVisible={3} />);
      expect(html).toContain('data-slot="overflow"');
      expect(html).toContain("+3");
      expect(count(html, /<li\b[^>]*data-slot="item"/g)).toBe(3);
    });

    it("keeps the first and last items visible when collapsing", () => {
      const html = render(() => <RLBreadcrumb items={many} maxVisible={3} />);
      expect(html).toContain(">1<");
      expect(html).toContain(">6<");
      expect(html).not.toContain(">3<");
    });

    it("does not collapse when the item count fits maxVisible", () => {
      const html = render(() => <RLBreadcrumb items={many} maxVisible={6} />);
      expect(html).not.toContain('data-slot="overflow"');
    });
  });

  describe("Slots", () => {
    it("replaces the whole item with itemSlot and passes the item context", () => {
      const html = render(() => (
        <RLBreadcrumb
          items={items}
          itemSlot={({ item, index }) => (
            <span data-custom-item={String(index)}>{item.label}!</span>
          )}
        />
      ));
      expect(html).toContain('data-custom-item="0"');
      expect(html).not.toContain('data-slot="link"');
    });

    it("replaces the label with itemLabelSlot", () => {
      const html = render(() => (
        <RLBreadcrumb items={items} itemLabelSlot={() => <em data-custom-label="">x</em>} />
      ));
      expect(html).toMatch(/data-custom-label(=""|\s|>)/);
      expect(html).not.toContain(">Home<");
    });

    it("renders itemLeadingSlot before the label", () => {
      const html = render(() => (
        <RLBreadcrumb items={items} itemLeadingSlot={() => <b data-leading="">L</b>} />
      ));
      expect(count(html, /data-leading(=""|\s|>)/g)).toBe(4);
      expect(html).toContain('data-slot="item-leading"');
    });

    it("renders itemTrailingSlot after the label", () => {
      const html = render(() => (
        <RLBreadcrumb items={items} itemTrailingSlot={() => <b data-trailing="">T</b>} />
      ));
      expect(count(html, /data-trailing(=""|\s|>)/g)).toBe(4);
      expect(html).toContain('data-slot="item-trailing"');
    });

    it("renders the separatorSlot in place of the separator icon", () => {
      const html = render(() => (
        <RLBreadcrumb items={items} separatorSlot={() => <i data-sep="">/</i>} />
      ));
      expect(count(html, /data-sep(=""|\s|>)/g)).toBe(3);
      expect(html).not.toContain('data-slot="separator-icon"');
    });

    it("passes the item and index to the separatorSlot render function", () => {
      const html = render(() => (
        <RLBreadcrumb
          items={items}
          separatorSlot={({ index }) => <i data-sep-index={String(index)}>/</i>}
        />
      ));
      expect(html).toContain('data-sep-index="0"');
      expect(html).toContain('data-sep-index="1"');
      expect(html).toContain('data-sep-index="2"');
    });
  });
});
