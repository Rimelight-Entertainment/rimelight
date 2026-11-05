import { describe, it, expect } from "vite-plus/test";

import { RLAccordion } from "../src/components/accordion/RLAccordion";
import type { AccordionItem } from "../src/components/accordion/accordion.types";
import { renderSolid } from "./utils/normalize";

const SAMPLE_ITEMS: AccordionItem[] = [
  {
    label: "Getting Started",
    icon: "lucide:rocket",
    content: "Installation and quick start guide.",
  },
  { label: "Component Architecture", icon: "layers", content: "Reactive primitives and tokens." },
  { label: "Accessibility", content: "ARIA patterns and focus management." },
];

const countOpenItems = (html: string) =>
  (html.match(/<details[^>]*data-state="open"/g) ?? []).length;

describe("RLAccordion", () => {
  describe("Summary mode (summary + children)", () => {
    it("renders a details root with the summary label and body children", () => {
      const html = renderSolid(
        RLAccordion,
        { summary: "System Information" },
        <p>Version 2.0.0</p>,
      );
      expect(html.startsWith("<details")).toBe(true);
      expect(html).toContain('data-slot="trigger"');
      expect(html).toContain("System Information");
      expect(html).toContain('data-slot="body"');
      expect(html).toContain("Version 2.0.0");
    });

    it("renders the root as the element given by the as prop", () => {
      const html = renderSolid(RLAccordion, { summary: "Section", as: "section" }, <p>Body</p>);
      expect(html.startsWith("<section")).toBe(true);
    });

    it("forwards name to the details root", () => {
      const html = renderSolid(RLAccordion, { summary: "Grouped", name: "faq" }, <p>Body</p>);
      expect(html).toContain('name="faq"');
    });

    it("renders the default trailing icon when no trailing slot is given", () => {
      const html = renderSolid(RLAccordion, { summary: "Default" }, <p>Body</p>);
      expect(html).toContain('data-slot="trailing-icon"');
    });

    it("passes the summary label to trailingSlot as item 0", () => {
      const html = renderSolid(
        RLAccordion,
        {
          summary: "Diagnostics",
          trailingSlot: ({ item, index }: { item: AccordionItem; index: number }) => (
            <span data-testid="trailing">
              {item.label}:{index}
            </span>
          ),
        },
        <p>Body</p>,
      );
      expect(html).toContain('data-testid="trailing"');
      expect(html).toContain("Diagnostics:0");
      expect(html).not.toContain('data-slot="trailing-icon"');
    });

    it("marks the trigger aria-disabled when disabled", () => {
      const html = renderSolid(RLAccordion, { summary: "Locked", disabled: true }, <p>Body</p>);
      expect(html).toContain('aria-disabled="true"');
    });
  });

  describe("Items mode", () => {
    it("renders one item per entry with closed state by default", () => {
      const html = renderSolid(RLAccordion, { items: SAMPLE_ITEMS });
      expect((html.match(/data-slot="item"/g) ?? []).length).toBe(3);
      expect(countOpenItems(html)).toBe(0);
      expect(html).not.toContain("Installation and quick start guide.");
    });

    it("falls back to the item index as data-value when value is missing", () => {
      const html = renderSolid(RLAccordion, { items: SAMPLE_ITEMS });
      expect(html).toContain('data-value="0"');
      expect(html).toContain('data-value="2"');
    });

    it("uses item.value as data-value when provided", () => {
      const html = renderSolid(RLAccordion, {
        items: [{ label: "Keyed", value: "getting-started", content: "Keyed body" }],
      });
      expect(html).toContain('data-value="getting-started"');
    });

    it("renders the leading icon only for items that declare one", () => {
      const html = renderSolid(RLAccordion, { items: SAMPLE_ITEMS });
      expect((html.match(/data-slot="leading-icon"/g) ?? []).length).toBe(2);
    });

    it("renders a trailing icon on every item by default", () => {
      const html = renderSolid(RLAccordion, { items: SAMPLE_ITEMS });
      expect((html.match(/data-slot="trailing-icon"/g) ?? []).length).toBe(3);
    });

    it("renders the body of the item selected by defaultValue and opens it", () => {
      const html = renderSolid(RLAccordion, { items: SAMPLE_ITEMS, defaultValue: "1" });
      expect(countOpenItems(html)).toBe(1);
      expect(html).toContain("Reactive primitives and tokens.");
      expect(html).not.toContain("Installation and quick start guide.");
      expect(html).toMatch(/data-slot="root"[^>]*data-value="1"/);
    });

    it("opens every item listed in a multiple-type value", () => {
      const html = renderSolid(RLAccordion, {
        items: SAMPLE_ITEMS,
        type: "multiple",
        value: ["0", "2"],
      });
      expect(countOpenItems(html)).toBe(2);
      expect(html).toContain("Installation and quick start guide.");
      expect(html).toContain("ARIA patterns and focus management.");
      expect(html).not.toContain("Reactive primitives and tokens.");
      expect(html).toMatch(/data-slot="root"[^>]*data-value="0 2"/);
    });

    it("opens the first item when collapsible is false and no value is given", () => {
      const html = renderSolid(RLAccordion, { items: SAMPLE_ITEMS, collapsible: false });
      expect(countOpenItems(html)).toBe(1);
      expect(html).toContain("Installation and quick start guide.");
    });

    it("keeps closed bodies mounted when unmountOnHide is false", () => {
      const html = renderSolid(RLAccordion, { items: SAMPLE_ITEMS, unmountOnHide: false });
      expect(countOpenItems(html)).toBe(0);
      expect(html).toContain("Installation and quick start guide.");
      expect(html).toContain("Reactive primitives and tokens.");
    });

    it("marks every item aria-disabled when the root is disabled", () => {
      const html = renderSolid(RLAccordion, { items: SAMPLE_ITEMS, disabled: true });
      expect((html.match(/aria-disabled="true"/g) ?? []).length).toBe(3);
    });

    it("marks only the disabled item aria-disabled", () => {
      const html = renderSolid(RLAccordion, {
        items: [SAMPLE_ITEMS[0], { ...SAMPLE_ITEMS[1], disabled: true }, SAMPLE_ITEMS[2]],
      });
      expect((html.match(/aria-disabled="true"/g) ?? []).length).toBe(1);
    });

    it("renders labels as text, not markup", () => {
      const html = renderSolid(RLAccordion, {
        items: [{ label: "<b>Bold</b>", content: "x" }],
      });
      expect(html).toContain("&lt;b");
      expect(html).toContain("Bold&lt;/b");
      expect(html).not.toContain("<b>Bold</b>");
    });

    it("renders as a section when as is given", () => {
      const html = renderSolid(RLAccordion, { items: SAMPLE_ITEMS, as: "section" });
      expect(html.startsWith("<section")).toBe(true);
      expect(html).toContain('data-slot="root"');
    });

    it("appends item.class to the item root", () => {
      const html = renderSolid(RLAccordion, {
        items: [{ label: "Styled", content: "x", class: "custom-item-class" }],
      });
      expect(html).toContain("custom-item-class");
    });
  });

  describe("Slots", () => {
    it("replaces the default leading icon with leadingSlot output", () => {
      const html = renderSolid(RLAccordion, {
        items: SAMPLE_ITEMS,
        leadingSlot: ({ item }: { item: AccordionItem }) => <b data-testid="lead">{item.label}</b>,
      });
      expect(html).toContain('data-testid="lead"');
      expect(html).not.toContain('data-slot="leading-icon"');
    });

    it("replaces the default chevron with trailingSlot output for each item", () => {
      const html = renderSolid(RLAccordion, {
        items: SAMPLE_ITEMS,
        trailingSlot: ({ index }: { index: number }) => <i data-testid="trail">{index}</i>,
      });
      expect((html.match(/data-testid="trail"/g) ?? []).length).toBe(3);
      expect(html).not.toContain('data-slot="trailing-icon"');
    });

    it("renders bodySlot output in place of item.content for open items", () => {
      const html = renderSolid(RLAccordion, {
        items: SAMPLE_ITEMS,
        defaultValue: "1",
        bodySlot: ({ item, index }: { item: AccordionItem; index: number }) => (
          <p data-testid="custom-body">
            {index}:{item.label}
          </p>
        ),
      });
      expect(html).toContain('data-testid="custom-body"');
      expect(html).toContain("1:Component Architecture");
      expect(html).not.toContain("Reactive primitives and tokens.");
    });
  });
});
