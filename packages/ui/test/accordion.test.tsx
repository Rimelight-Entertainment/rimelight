import { describe, it, expect, vi } from "vite-plus/test";
import { renderToString } from "@solidjs/web";

vi.mock("virtual:rimelight/ui", () => ({
  default: {
    unstyled: false,
    components: { themes: {} },
    icons: {},
  },
}));

import { RLAccordion } from "../src/components/accordion/RLAccordion";
import type { AccordionItem } from "../src/components/accordion/accordion.types";
import { renderSolid, cleanHtml } from "./utils/normalize";

const SAMPLE_ITEMS: AccordionItem[] = [
  {
    label: "Getting Started",
    icon: "i-lucide-rocket",
    content: "Installation and quick start guide for Rimelight UI.",
  },
  {
    label: "Component Architecture",
    icon: "i-lucide-layers",
    content: "Deep dive into reactive primitives and design tokens.",
  },
  {
    label: "Accessibility Standards",
    icon: "i-lucide-accessibility",
    content: "ARIA patterns, keyboard focus management, and screen reader support.",
  },
];

describe("RLAccordion Solid Component Suite", () => {
  describe("Single-Summary Mode (summary + children)", () => {
    it("renders <details> root with summary trigger and body content", () => {
      const html = cleanHtml(
        renderToString(() => (
          <RLAccordion summary="System Information">
            <p>Version 2.0.0 (Production Build)</p>
          </RLAccordion>
        )),
      );

      expect(html.startsWith("<details")).toBe(true);
      expect(html).toContain('data-slot="root"');
      expect(html).toContain('data-slot="trigger"');
      expect(html).toContain('data-slot="label"');
      expect(html).toContain("System Information");
      expect(html).toContain('data-slot="trailing-icon"');
      expect(html).toContain('data-slot="content"');
      expect(html).toContain('data-slot="body"');
      expect(html).toContain("Version 2.0.0 (Production Build)");
    });

    it("renders custom trailing icon prop or slot in summary mode", () => {
      const htmlIcon = cleanHtml(
        renderToString(() => (
          <RLAccordion summary="Diagnostics" trailingIcon="i-lucide-settings">
            <span>Diagnostics Output</span>
          </RLAccordion>
        )),
      );
      expect(htmlIcon).toContain("i-lucide-settings");

      const htmlSlot = cleanHtml(
        renderToString(() => (
          <RLAccordion
            summary="Diagnostics"
            trailingIconSlot={<span class="custom-badge-icon">PLUS</span>}
          >
            <span>Diagnostics Output</span>
          </RLAccordion>
        )),
      );
      expect(htmlSlot).toContain("custom-badge-icon");
      expect(htmlSlot).toContain("PLUS");
    });

    it("handles disabled state in summary mode", () => {
      const html = cleanHtml(
        renderToString(() => (
          <RLAccordion summary="Locked Panel" disabled>
            <span>Secret Content</span>
          </RLAccordion>
        )),
      );

      expect(html).toContain('aria-disabled="true"');
      expect(html).toContain("pointer-events-none");
      expect(html).toContain("cursor-not-allowed");
    });

    it("supports polymorphic as prop in summary mode", () => {
      const html = cleanHtml(
        renderToString(() => (
          <RLAccordion as="section" summary="Section Summary">
            <span>Section Content</span>
          </RLAccordion>
        )),
      );

      expect(html.startsWith("<section")).toBe(true);
      expect(html.endsWith("</section>")).toBe(true);
      expect(html).toContain("Section Summary");
    });

    it("forwards name attribute for native grouping in summary mode", () => {
      const html = cleanHtml(
        renderToString(() => (
          <RLAccordion summary="Grouped Details" name="native-summary-group">
            <span>Grouped Item Body</span>
          </RLAccordion>
        )),
      );

      expect(html).toContain('name="native-summary-group"');
    });
  });

  describe("Items Mode - Structure & Slots", () => {
    it("renders items root container with default slots and classes", () => {
      const html = renderSolid(RLAccordion, { items: SAMPLE_ITEMS });

      expect(html).toContain('data-slot="root"');
      expect(html).toContain("w-full");

      // Details item slots
      expect(html).toContain('data-slot="item"');
      expect(html).toContain('data-slot="trigger"');
      expect(html).toContain('data-slot="label"');
      expect(html).toContain('data-slot="leading-icon"');
      expect(html).toContain('data-slot="trailing-icon"');

      // Item contents
      expect(html).toContain("Getting Started");
      expect(html).toContain("Component Architecture");
      expect(html).toContain("Accessibility Standards");
      expect(html).toContain("i-lucide-rocket");
      expect(html).toContain("i-lucide-layers");
      expect(html).toContain("i-lucide-accessibility");
    });

    it("assigns fallback string index values when item.value is omitted", () => {
      const html = renderSolid(RLAccordion, { items: SAMPLE_ITEMS });

      expect(html).toContain('data-value="0"');
      expect(html).toContain('data-value="1"');
      expect(html).toContain('data-value="2"');
    });

    it("uses explicit item.value when provided", () => {
      const items: AccordionItem[] = [
        { label: "Tab A", value: "tab-a", content: "Content A" },
        { label: "Tab B", value: "tab-b", content: "Content B" },
      ];
      const html = renderSolid(RLAccordion, { items });

      expect(html).toContain('data-value="tab-a"');
      expect(html).toContain('data-value="tab-b"');
    });
  });

  describe("Single Mode Open/Close State (Controlled & Uncontrolled)", () => {
    it("starts all closed by default when no defaultValue is specified", () => {
      const html = renderSolid(RLAccordion, { items: SAMPLE_ITEMS });

      // All items closed
      const closedMatches = html.match(/data-state="closed"/g);
      expect(closedMatches?.length).toBe(3);
      expect(html).not.toContain('data-state="open"');
      expect(html).not.toContain("<details open");
    });

    it("opens single item via defaultValue (uncontrolled)", () => {
      const html = renderSolid(RLAccordion, {
        items: SAMPLE_ITEMS,
        defaultValue: "1",
      });

      expect(html).toContain('data-value="1" data-state="open"');
      expect(html).toContain('data-value="0" data-state="closed"');
      expect(html).toContain('data-value="2" data-state="closed"');
      expect(html).toContain("Deep dive into reactive primitives");
    });

    it("respects controlled value prop", () => {
      const html = renderSolid(RLAccordion, {
        items: SAMPLE_ITEMS,
        value: "2",
      });

      expect(html).toContain('data-slot="root" data-value="2"');
      expect(html).toContain('data-value="2" data-state="open"');
      expect(html).toContain("ARIA patterns, keyboard focus management");
      expect(html).not.toContain("Installation and quick start guide");
    });

    it("handles controlled undefined value keeping all items closed", () => {
      const html = renderSolid(RLAccordion, {
        items: SAMPLE_ITEMS,
        value: undefined,
      });

      const closedMatches = html.match(/data-state="closed"/g);
      expect(closedMatches?.length).toBe(3);
      expect(html).not.toContain('data-state="open"');
    });
  });

  describe("Multiple Mode Open/Close State (type='multiple' / multiple={true})", () => {
    it("opens multiple items via array defaultValue in multiple mode", () => {
      const html = renderSolid(RLAccordion, {
        type: "multiple",
        items: SAMPLE_ITEMS,
        defaultValue: ["0", "2"],
      });

      expect(html).toContain('data-slot="root" data-value="0 2"');
      expect(html).toContain('data-value="0" data-state="open"');
      expect(html).toContain('data-value="1" data-state="closed"');
      expect(html).toContain('data-value="2" data-state="open"');

      // Both open contents rendered
      expect(html).toContain("Installation and quick start guide");
      expect(html).toContain("ARIA patterns, keyboard focus management");
      // Closed content not rendered (unmountOnHide default)
      expect(html).not.toContain("Deep dive into reactive primitives");
    });

    it("supports multiple alias prop (multiple={true})", () => {
      const items: AccordionItem[] = [
        { label: "First", value: "first", content: "First Body" },
        { label: "Second", value: "second", content: "Second Body" },
      ];
      const html = renderSolid(RLAccordion, {
        multiple: true,
        items,
        defaultValue: ["first", "second"],
      });

      expect(html).toContain('data-value="first second"');
      expect(html).toContain("First Body");
      expect(html).toContain("Second Body");
    });

    it("respects controlled array value in multiple mode", () => {
      const items: AccordionItem[] = [
        { label: "M1", value: "m1", content: "M1 Content" },
        { label: "M2", value: "m2", content: "M2 Content" },
        { label: "M3", value: "m3", content: "M3 Content" },
      ];
      const html = renderSolid(RLAccordion, {
        type: "multiple",
        items,
        value: ["m2", "m3"],
      });

      expect(html).toContain('data-slot="root" data-value="m2 m3"');
      expect(html).toContain('data-value="m1" data-state="closed"');
      expect(html).toContain('data-value="m2" data-state="open"');
      expect(html).toContain('data-value="m3" data-state="open"');
    });
  });

  describe("UnmountOnHide Semantics", () => {
    it("unmounts collapsed item content from DOM by default (unmountOnHide=true)", () => {
      const html = renderSolid(RLAccordion, {
        items: SAMPLE_ITEMS,
        defaultValue: "0",
      });

      // Item 0 is open -> content is present
      expect(html).toContain("Installation and quick start guide");
      // Item 1 and 2 are closed -> unmounted from DOM
      expect(html).not.toContain("Deep dive into reactive primitives");
      expect(html).not.toContain("ARIA patterns, keyboard focus management");
    });

    it("keeps collapsed item content mounted in DOM when unmountOnHide=false", () => {
      const html = renderSolid(RLAccordion, {
        items: SAMPLE_ITEMS,
        defaultValue: "0",
        unmountOnHide: false,
      });

      // All item contents are mounted in the DOM
      expect(html).toContain("Installation and quick start guide");
      expect(html).toContain("Deep dive into reactive primitives");
      expect(html).toContain("ARIA patterns, keyboard focus management");

      // Check data-state attributes on content divs
      expect(html).toContain('data-slot="content" data-state="open"');
      expect(html).toContain('data-slot="content" data-state="closed"');
    });
  });

  describe("Custom valueKey and labelKey with Dot Paths", () => {
    it("resolves top-level custom keys", () => {
      const customItems = [
        { id: "alpha", title: "Alpha Title", content: "Alpha Body" },
        { id: "beta", title: "Beta Title", content: "Beta Body" },
      ];

      const html = renderSolid(RLAccordion, {
        items: customItems as any,
        valueKey: "id",
        labelKey: "title",
        defaultValue: "beta",
      });

      expect(html).toContain('data-value="alpha"');
      expect(html).toContain('data-value="beta" data-state="open"');
      expect(html).toContain("Alpha Title");
      expect(html).toContain("Beta Title");
      expect(html).toContain("Beta Body");
    });

    it("resolves nested dot paths for valueKey and labelKey", () => {
      const nestedItems = [
        { meta: { id: "n1", header: { title: "Nested One" } }, content: "Nested Body 1" },
        { meta: { id: "n2", header: { title: "Nested Two" } }, content: "Nested Body 2" },
      ];

      const html = renderSolid(RLAccordion, {
        items: nestedItems as any,
        valueKey: "meta.id",
        labelKey: "meta.header.title",
        defaultValue: "n1",
      });

      expect(html).toContain('data-value="n1" data-state="open"');
      expect(html).toContain('data-value="n2" data-state="closed"');
      expect(html).toContain("Nested One");
      expect(html).toContain("Nested Two");
      expect(html).toContain("Nested Body 1");
    });
  });

  describe("Leading & Trailing Slot Renderers and Icon Hierarchy", () => {
    it("renders custom leading slot renderer", () => {
      const html = cleanHtml(
        renderToString(() => (
          <RLAccordion
            items={SAMPLE_ITEMS}
            leading={(item, index) => (
              <span class="custom-badge-leading">
                Badge #{index}: {item.label}
              </span>
            )}
          />
        )),
      );

      expect(html).toContain("custom-badge-leading");
      expect(html).toContain("Badge #0: Getting Started");
      expect(html).toContain("Badge #1: Component Architecture");
    });

    it("renders custom trailing slot renderer", () => {
      const html = cleanHtml(
        renderToString(() => (
          <RLAccordion
            items={SAMPLE_ITEMS}
            trailing={(_item, index) => <span class="custom-trailing-action">Action {index}</span>}
          />
        )),
      );

      expect(html).toContain("custom-trailing-action");
      expect(html).toContain("Action 0");
      expect(html).toContain("Action 1");
    });

    it("prefers per-item trailingIcon over global trailingIcon", () => {
      const items: AccordionItem[] = [
        { label: "Global Chevron", content: "Uses root icon" },
        {
          label: "Custom Arrow",
          trailingIcon: "i-lucide-arrow-right",
          content: "Uses item icon",
        },
      ];

      const html = renderSolid(RLAccordion, {
        items,
        trailingIcon: "i-lucide-plus",
      });

      expect(html).toContain("i-lucide-plus");
      expect(html).toContain("i-lucide-arrow-right");
    });

    it("renders trailingIconSlot when provided", () => {
      const html = cleanHtml(
        renderToString(() => (
          <RLAccordion
            items={SAMPLE_ITEMS}
            trailingIconSlot={<span class="global-trailing-slot">SLOT</span>}
          />
        )),
      );

      expect(html).toContain("global-trailing-slot");
      expect(html).toContain("SLOT");
    });
  });

  describe("Body, Content & Named Slot Renderers", () => {
    it("renders custom body render prop", () => {
      const html = cleanHtml(
        renderToString(() => (
          <RLAccordion
            items={SAMPLE_ITEMS}
            defaultValue="0"
            body={(item, index) => (
              <p class="custom-body-renderer">
                Item [{index}]: {item.content}
              </p>
            )}
          />
        )),
      );

      expect(html).toContain("custom-body-renderer");
      expect(html).toContain("Item [0]: Installation and quick start guide for Rimelight UI.");
    });

    it("renders custom content render prop replacing default content wrapper", () => {
      const html = cleanHtml(
        renderToString(() => (
          <RLAccordion
            items={SAMPLE_ITEMS}
            defaultValue="0"
            content={(item, index) => (
              <article class="custom-content-wrapper" data-index={index}>
                <h4>{item.label}</h4>
                <p>{item.content}</p>
              </article>
            )}
          />
        )),
      );

      expect(html).toContain("custom-content-wrapper");
      expect(html).toContain('data-index="0"');
      expect(html).toContain("<h4>Getting Started</h4>");
    });

    it("renders named item slot from slots record", () => {
      const items: AccordionItem[] = [
        { label: "Standard Item", value: "standard", content: "Standard text" },
        {
          label: "Special Item",
          value: "special",
          slot: "specialSlot",
          content: "Special text",
        },
      ];

      const html = cleanHtml(
        renderToString(() => (
          <RLAccordion
            items={items}
            defaultValue="special"
            slots={{
              specialSlot: (item) => <div class="named-slot-output">SPECIAL: {item.content}</div>,
            }}
          />
        )),
      );

      expect(html).toContain("named-slot-output");
      expect(html).toContain("SPECIAL: Special text");
    });

    it("prefers slot + '-body' named renderer when available", () => {
      const items: AccordionItem[] = [
        {
          label: "Target Item",
          value: "target",
          slot: "targetSlot",
          content: "Target text",
        },
      ];

      const html = cleanHtml(
        renderToString(() => (
          <RLAccordion
            items={items}
            defaultValue="target"
            slots={{
              targetSlot: () => <div>Fallback Slot</div>,
              "targetSlot-body": (item) => <div>Specific Body Slot: {item.content}</div>,
            }}
          />
        )),
      );

      expect(html).toContain("Specific Body Slot: Target text");
      expect(html).not.toContain("Fallback Slot");
    });
  });

  describe("Theme Classes, UI Prop & Per-item UI Overrides (mergeUi)", () => {
    it("applies root class and root ui prop", () => {
      const html = renderSolid(RLAccordion, {
        items: SAMPLE_ITEMS,
        class: "my-accordion-root",
        ui: {
          root: "shadow-lg",
          trigger: "hover:bg-elevated/50",
          label: "font-semibold",
        },
      });

      expect(html).toContain("my-accordion-root");
      expect(html).toContain("shadow-lg");
      expect(html).toContain("hover:bg-elevated/50");
      expect(html).toContain("font-semibold");
    });

    it("merges per-item item.class into the item slot", () => {
      const items: AccordionItem[] = [
        { label: "Normal Item", content: "Normal" },
        { label: "Highlighted Item", class: "bg-primary/10 border-primary", content: "Highlight" },
      ];

      const html = renderSolid(RLAccordion, { items });

      expect(html).toContain("bg-primary/10");
      expect(html).toContain("border-primary");
    });

    it("merges per-item item.ui overrides per slot", () => {
      const items: AccordionItem[] = [
        { label: "Item 1", content: "Content 1" },
        {
          label: "Item 2",
          content: "Content 2",
          ui: {
            label: "text-rose-500 font-bold",
            trigger: "bg-rose-500/10",
          },
        },
      ];

      const html = renderSolid(RLAccordion, { items });

      expect(html).toContain("text-rose-500");
      expect(html).toContain("font-bold");
      expect(html).toContain("bg-rose-500/10");
    });
  });

  describe("Disabled States Matrix (Root vs Item Disabled)", () => {
    it("disables all triggers when root disabled=true", () => {
      const html = renderSolid(RLAccordion, {
        items: SAMPLE_ITEMS,
        disabled: true,
      });

      const disabledTriggers = html.match(/aria-disabled="true"/g);
      expect(disabledTriggers?.length).toBe(3);
      expect(html).toContain("pointer-events-none");
      expect(html).toContain("cursor-not-allowed");
    });

    it("disables only specific item when item.disabled=true", () => {
      const items: AccordionItem[] = [
        { label: "Enabled 1", content: "Can open" },
        { label: "Disabled 2", disabled: true, content: "Cannot open" },
        { label: "Enabled 3", content: "Can open" },
      ];

      const html = renderSolid(RLAccordion, { items });

      const disabledTriggers = html.match(/aria-disabled="true"/g);
      expect(disabledTriggers?.length).toBe(1);
      expect(html).toContain("Disabled 2");
    });
  });

  describe("Native Exclusive Grouping (name prop)", () => {
    it("forwards explicit name prop to all <details> elements", () => {
      const html = renderSolid(RLAccordion, {
        items: SAMPLE_ITEMS,
        name: "faq-accordion-group",
      });

      const nameMatches = html.match(/name="faq-accordion-group"/g);
      expect(nameMatches?.length).toBe(3);
    });

    it("does not render name attribute when name prop is omitted", () => {
      const html = renderSolid(RLAccordion, { items: SAMPLE_ITEMS });
      expect(html).not.toContain('name="');
    });
  });

  describe("Polymorphic as Prop & Rest Props Forwarding", () => {
    it("renders custom items root element when as='section'", () => {
      const html = renderSolid(RLAccordion, {
        items: SAMPLE_ITEMS,
        as: "section",
      });

      expect(html.startsWith("<section")).toBe(true);
      expect(html.endsWith("</section>")).toBe(true);
      expect(html).toContain('data-slot="root"');
    });

    it("forwards extra HTML attributes and omits internal component props", () => {
      const html = renderSolid(RLAccordion, {
        items: SAMPLE_ITEMS,
        id: "faq-section",
        "data-testid": "accordion-test-id",
        role: "region",
        "aria-label": "Frequently Asked Questions",
      });

      expect(html).toContain('id="faq-section"');
      expect(html).toContain('data-testid="accordion-test-id"');
      expect(html).toContain('role="region"');
      expect(html).toContain('aria-label="Frequently Asked Questions"');

      // Internal props omitted
      expect(html).not.toContain('items="');
      expect(html).not.toContain('unmountOnHide="');
      expect(html).not.toContain('collapsible="');
    });
  });

  describe("Reactivity & Signal State Binding", () => {
    it("updates rendered output correctly when controlled signal values are passed", () => {
      const renderWithValue = (val: string | undefined) =>
        cleanHtml(renderToString(() => <RLAccordion items={SAMPLE_ITEMS} value={val} />));

      // State: 0 is open
      let html = renderWithValue("0");
      expect(html).toContain('data-value="0" data-state="open"');
      expect(html).toContain('data-value="1" data-state="closed"');

      // State: 1 is open
      html = renderWithValue("1");
      expect(html).toContain('data-value="0" data-state="closed"');
      expect(html).toContain('data-value="1" data-state="open"');
      expect(html).toContain("Deep dive into reactive primitives");

      // State: undefined (all closed)
      html = renderWithValue(undefined);
      expect(html).toContain('data-value="0" data-state="closed"');
      expect(html).toContain('data-value="1" data-state="closed"');
      expect(html).not.toContain('data-state="open"');
    });
  });
});
