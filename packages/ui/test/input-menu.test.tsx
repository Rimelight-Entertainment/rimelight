import { describe, it, expect } from "vite-plus/test";

import { RLInputMenu } from "../src/components/input-menu/RLInputMenu";
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

function triggerTag(html: string): string {
  const match = html.match(/<button[^>]*data-input-menu-trigger[^>]*>/);
  return match?.[0] ?? "";
}

function hiddenValue(html: string): string | undefined {
  const match = html.match(/<input[^>]*data-input-menu-hidden-input[^>]*>/);
  return match ? attr(match[0], "value") : undefined;
}

describe("RLInputMenu", () => {
  const items = ["Alpha", { label: "Beta", value: "b" }];

  describe("Value and placeholder", () => {
    it("shows the placeholder when nothing is selected", () => {
      const html = render(() => <RLInputMenu items={items} placeholder="Pick one" />);
      const valueText = html.match(/data-input-menu-value[^>]*>([^<]*)</)?.[1];

      expect(valueText).toBe("Pick one");
    });

    it("shows the label of the defaultValue item in the trigger", () => {
      const html = render(() => <RLInputMenu items={items} defaultValue="b" />);
      const valueText = html.match(/data-input-menu-value[^>]*>([^<]*)</)?.[1];

      expect(valueText).toBe("Beta");
      expect(hiddenValue(html)).toBe("b");
    });

    it("follows the controlled value over defaultValue", () => {
      const html = render(() => <RLInputMenu items={items} value="Alpha" defaultValue="b" />);

      expect(hiddenValue(html)).toBe("Alpha");
    });

    it("submits the hidden input under the name prop", () => {
      const html = render(() => <RLInputMenu items={items} name="choice" defaultValue="b" />);
      const hidden = html.match(/<input[^>]*data-input-menu-hidden-input[^>]*>/)?.[0] ?? "";

      expect(attr(hidden, "name")).toBe("choice");
    });
  });

  describe("Closed state", () => {
    it("renders the trigger collapsed with listbox popup semantics", () => {
      const html = render(() => <RLInputMenu items={items} />);
      const trigger = triggerTag(html);

      expect(attr(trigger, "aria-expanded")).toBe("false");
      expect(attr(trigger, "aria-haspopup")).toBe("listbox");
    });

    it("does not render the options until opened", () => {
      const html = render(() => <RLInputMenu items={items} />);

      expect(html).not.toContain('role="option"');
      expect(slotTag(html, "content")).toBe("");
    });
  });

  describe("States", () => {
    it("disables the trigger and flags the root when disabled", () => {
      const html = render(() => <RLInputMenu items={items} disabled />);

      expect(slotTag(html, "root")).toMatch(/\sdata-disabled(=""|\s|>)/);
      expect(triggerTag(html)).toMatch(/\sdisabled(=""|\s|>)/);
    });

    it("omits the disabled flag when enabled", () => {
      const html = render(() => <RLInputMenu items={items} />);

      expect(slotTag(html, "root")).not.toContain("data-disabled");
    });
  });

  describe("Label and accessibility", () => {
    it("renders a visible label bound to the trigger", () => {
      const html = render(() => <RLInputMenu items={items} label="Category" />);
      const label = slotTag(html, "label");
      const trigger = triggerTag(html);

      expect(html).toContain("Category");
      expect(attr(label, "for")).toBe(attr(trigger, "id"));
    });

    it("omits the label when no label prop is given", () => {
      const html = render(() => <RLInputMenu items={items} />);

      expect(slotTag(html, "label")).toBe("");
    });

    it("applies aria-label, aria-labelledby and aria-describedby to the trigger", () => {
      const html = render(() => (
        <RLInputMenu
          items={items}
          aria-label="Choose a letter"
          aria-labelledby="menu-heading"
          aria-describedby="menu-hint"
        />
      ));
      const trigger = triggerTag(html);

      expect(attr(trigger, "aria-label")).toBe("Choose a letter");
      expect(attr(trigger, "aria-labelledby")).toBe("menu-heading");
      expect(attr(trigger, "aria-describedby")).toBe("menu-hint");
    });
  });
});
