import { describe, it, expect } from "vite-plus/test";

import { RLCheckbox } from "../src/components/checkbox/RLCheckbox";
import { RLCheckboxGroup } from "../src/components/checkbox-group/RLCheckboxGroup";
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

describe("RLCheckbox & RLCheckboxGroup", () => {
  describe("Exports", () => {
    it("exports RLCheckbox and RLCheckboxGroup from index", () => {
      expect(components.RLCheckbox).toBeDefined();
      expect(components.RLCheckboxGroup).toBeDefined();
    });
  });

  describe("RLCheckbox — Structure & Slots", () => {
    it("renders default checkbox structure", () => {
      const html = render(() => <RLCheckbox label="Accept terms" />);
      expect(slotTag(html, "root")).not.toBe("");
      expect(slotTag(html, "container")).not.toBe("");
      expect(slotTag(html, "base")).not.toBe("");
      expect(slotTag(html, "indicator")).not.toBe("");
      expect(slotTag(html, "wrapper")).not.toBe("");
      expect(slotTag(html, "label")).not.toBe("");
      expect(html).toContain("Accept terms");
    });

    it("renders with description", () => {
      const html = render(() => (
        <RLCheckbox label="Notifications" description="Receive product updates." />
      ));
      expect(slotTag(html, "description")).not.toBe("");
      expect(html).toContain("Receive product updates.");
    });

    it("supports custom labelSlot and descriptionSlot functions and nodes", () => {
      const html = render(() => (
        <RLCheckbox
          label="Default Label"
          description="Default Desc"
          labelSlot={({ label }) => <strong>Custom: {label}</strong>}
          descriptionSlot={<span class="custom-desc">Custom Node Desc</span>}
        />
      ));
      expect(html).toContain("Custom: Default Label");
      expect(html).toContain("Custom Node Desc");
      expect(html).not.toContain("Default Desc");
    });

    it("renders children as label content", () => {
      const html = render(() => (
        <RLCheckbox>
          <span class="custom-child">Child Element Content</span>
        </RLCheckbox>
      ));
      expect(html).toContain("Child Element Content");
    });

    it("renders bare checkbox with no label or description", () => {
      const html = render(() => <RLCheckbox aria-label="Select row" />);
      expect(slotTag(html, "root")).not.toBe("");
      expect(slotTag(html, "container")).not.toBe("");
      expect(slotTag(html, "base")).not.toBe("");
      expect(slotTag(html, "label")).toBe("");
      expect(slotTag(html, "description")).toBe("");
      expect(html).toContain('aria-label="Select row"');
    });
  });

  describe("RLCheckbox — States & Accessibility", () => {
    it("renders unchecked state by default", () => {
      const html = render(() => <RLCheckbox label="Test" />);
      const root = slotTag(html, "root");
      expect(attr(root, "data-state")).toBe("unchecked");
      expect(html).not.toContain('checked=""');
    });

    it("renders checked state via checked prop", () => {
      const html = render(() => <RLCheckbox checked label="Checked Checkbox" />);
      const root = slotTag(html, "root");
      expect(attr(root, "data-state")).toBe("checked");
      expect(html).toContain("checked");
    });

    it("renders checked state via defaultChecked", () => {
      const html = render(() => <RLCheckbox defaultChecked label="Default Checked" />);
      const root = slotTag(html, "root");
      expect(attr(root, "data-state")).toBe("checked");
    });

    it("renders indeterminate state via checked='indeterminate'", () => {
      const html = render(() => <RLCheckbox checked="indeterminate" label="Indeterminate" />);
      const root = slotTag(html, "root");
      expect(attr(root, "data-state")).toBe("indeterminate");
      expect(html).toContain('aria-checked="mixed"');
    });

    it("renders indeterminate state via defaultChecked='indeterminate'", () => {
      const html = render(() => (
        <RLCheckbox defaultChecked="indeterminate" label="Indeterminate Default" />
      ));
      const root = slotTag(html, "root");
      expect(attr(root, "data-state")).toBe("indeterminate");
    });

    it("renders custom indeterminateIcon", () => {
      const html = render(() => (
        <RLCheckbox
          defaultChecked="indeterminate"
          indeterminateIcon="plus"
          label="Plus Indeterminate"
        />
      ));
      expect(html).toContain("i-lucide-plus");
    });

    it("renders disabled state", () => {
      const html = render(() => <RLCheckbox disabled label="Disabled Checkbox" />);
      const root = slotTag(html, "root");
      expect(attr(root, "data-disabled")).toBe("true");
      expect(html).toContain("disabled");
      expect(html).toContain('aria-disabled="true"');
    });

    it("renders required state and asterisk class", () => {
      const html = render(() => <RLCheckbox required label="Required Checkbox" />);
      expect(html).toContain("required");
      expect(html).toContain('aria-required="true"');
    });
  });

  describe("RLCheckbox — Indicators & Variants", () => {
    it("renders indicator='end' with reversed flex direction", () => {
      const html = render(() => <RLCheckbox indicator="end" label="End Indicator" />);
      const root = slotTag(html, "root");
      expect(root).toContain("flex-row-reverse");
    });

    it("renders indicator='hidden' with sr-only base and label icon", () => {
      const html = render(() => (
        <RLCheckbox indicator="hidden" icon="star" label="Icon Above Label" />
      ));
      const base = slotTag(html, "base");
      expect(base).toContain("sr-only");
      expect(html).toContain("star");
    });

    it("renders variant='card' with border treatment", () => {
      const html = render(() => <RLCheckbox variant="card" label="Card Checkbox" />);
      const root = slotTag(html, "root");
      expect(root).toContain("border border-default rounded-lg");
    });

    it("supports size scales", () => {
      const sizes = ["xs", "sm", "md", "lg", "xl"] as const;
      for (const size of sizes) {
        const html = render(() => <RLCheckbox size={size} label={`Size ${size}`} />);
        expect(html).toContain(`Size ${size}`);
      }
    });

    it("supports custom colors via color prop", () => {
      const html = render(() => <RLCheckbox color="neutral" checked label="Neutral Checkbox" />);
      expect(html).toContain("rl-color-neutral");
    });
  });

  describe("RLCheckboxGroup — Structure & Normalization", () => {
    const stringItems = ["System", "Light", "Dark"];
    const objectItems = [
      { label: "System", value: "system", description: "Matches device settings." },
      { label: "Light", value: "light", description: "Always uses light theme." },
      { label: "Dark", value: "dark", description: "Always uses dark theme." },
    ];

    it("renders group with string items", () => {
      const html = render(() => <RLCheckboxGroup items={stringItems} legend="Theme Mode" />);
      expect(slotTag(html, "root")).not.toBe("");
      expect(slotTag(html, "fieldset")).not.toBe("");
      expect(slotTag(html, "legend")).not.toBe("");
      expect(html).toContain("Theme Mode");
      expect(html).toContain("System");
      expect(html).toContain("Light");
      expect(html).toContain("Dark");
    });

    it("renders group with object items and descriptions", () => {
      const html = render(() => <RLCheckboxGroup items={objectItems} />);
      expect(html).toContain("Matches device settings.");
      expect(html).toContain("Always uses light theme.");
      expect(html).toContain("Always uses dark theme.");
    });

    it("renders selected items according to value or defaultValue", () => {
      const html = render(() => <RLCheckboxGroup items={objectItems} value={["light", "dark"]} />);
      expect(html).toContain("checked");
    });

    it("supports custom valueKey, labelKey, and descriptionKey", () => {
      const customItems = [
        { id: "opt1", name: "Option 1", info: "First option info" },
        { id: "opt2", name: "Option 2", info: "Second option info" },
      ];
      const html = render(() => (
        <RLCheckboxGroup
          items={customItems}
          valueKey="id"
          labelKey="name"
          descriptionKey="info"
          defaultValue={["opt1"]}
        />
      ));
      expect(html).toContain("Option 1");
      expect(html).toContain("First option info");
      expect(html).toContain("Option 2");
    });

    it("supports horizontal and vertical orientations", () => {
      const vertHtml = render(() => <RLCheckboxGroup items={stringItems} orientation="vertical" />);
      expect(slotTag(vertHtml, "fieldset")).toContain("flex-col");

      const horizHtml = render(() => (
        <RLCheckboxGroup items={stringItems} orientation="horizontal" />
      ));
      expect(slotTag(horizHtml, "fieldset")).toContain("flex-row");
    });

    it("supports variant='table'", () => {
      const html = render(() => (
        <RLCheckboxGroup items={stringItems} variant="table" orientation="horizontal" />
      ));
      const fieldset = slotTag(html, "fieldset");
      expect(fieldset).toContain("-space-x-px");
    });

    it("supports custom legendSlot, labelSlot, and descriptionSlot", () => {
      const html = render(() => (
        <RLCheckboxGroup
          items={objectItems}
          legendSlot={<h3 class="custom-group-legend">Custom Group Legend</h3>}
          labelSlot={({ item }) => <span class="custom-item-label">Label: {item.label}</span>}
          descriptionSlot={({ item }) => (
            <span class="custom-item-desc">Desc: {item.description}</span>
          )}
        />
      ));
      expect(html).toContain("Custom Group Legend");
      expect(html).toContain("Label: System");
      expect(html).toContain("Desc: Matches device settings.");
    });

    it("disables the entire group when disabled prop is set", () => {
      const html = render(() => <RLCheckboxGroup items={stringItems} disabled />);
      const root = slotTag(html, "root");
      expect(attr(root, "data-disabled")).toBe("true");
      expect(html).toContain("disabled");
    });
  });

  describe("Custom UI & Theme Classes", () => {
    it("applies class prop to root elements", () => {
      const singleHtml = render(() => <RLCheckbox class="custom-checkbox-class" label="Label" />);
      expect(slotTag(singleHtml, "root")).toContain("custom-checkbox-class");

      const groupHtml = render(() => (
        <RLCheckboxGroup class="custom-group-class" items={["Item 1"]} />
      ));
      expect(slotTag(groupHtml, "root")).toContain("custom-group-class");
    });

    it("applies ui slot class overrides on RLCheckbox", () => {
      const html = render(() => (
        <RLCheckbox
          label="Styled"
          description="Desc"
          ui={{
            root: "custom-root-slot",
            container: "custom-container-slot",
            base: "custom-base-slot",
            indicator: "custom-indicator-slot",
            label: "custom-label-slot",
            description: "custom-desc-slot",
          }}
        />
      ));
      expect(slotTag(html, "root")).toContain("custom-root-slot");
      expect(slotTag(html, "container")).toContain("custom-container-slot");
      expect(slotTag(html, "base")).toContain("custom-base-slot");
      expect(slotTag(html, "indicator")).toContain("custom-indicator-slot");
      expect(slotTag(html, "label")).toContain("custom-label-slot");
      expect(slotTag(html, "description")).toContain("custom-desc-slot");
    });
  });
});
