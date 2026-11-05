import { describe, it, expect } from "vite-plus/test";
import { renderToString } from "@solidjs/web";

import { RLColorField } from "../src/components/color-field/RLColorField";
import { DEFAULT_COLOR_HEX } from "../src/constants/color";
import { cleanHtml } from "./utils/normalize";

function render(fn: () => any): string {
  return cleanHtml(renderToString(fn));
}

function tagWithSlot(html: string, slot: string): string {
  return html.match(new RegExp(`<[a-z]+[^>]*data-slot="${slot}"[^>]*>`))?.[0] ?? "";
}

function attr(tag: string, name: string): string | undefined {
  return tag.match(new RegExp(`\\s${name}="([^"]*)"`))?.[1];
}

describe("RLColorField", () => {
  describe("value", () => {
    it("shows the default hex when uncontrolled without defaultValue", () => {
      const html = render(() => <RLColorField />);
      expect(attr(tagWithSlot(html, "root"), "data-value")).toBe(DEFAULT_COLOR_HEX);
      expect(attr(tagWithSlot(html, "input"), "value")).toBe(DEFAULT_COLOR_HEX);
    });

    it("shows the full hex when no channel is set", () => {
      const html = render(() => <RLColorField defaultValue="#ff0000" />);
      expect(attr(tagWithSlot(html, "input"), "value")).toBe("#ff0000");
    });

    it("shows the channel value in the default hsl color space", () => {
      const html = render(() => <RLColorField channel="lightness" defaultValue="#ff0000" />);
      expect(attr(tagWithSlot(html, "input"), "value")).toBe("50");
    });

    it("shows the channel value in rgb when colorSpace is rgb", () => {
      const html = render(() => (
        <RLColorField channel="red" colorSpace="rgb" defaultValue="#ff0000" />
      ));
      expect(attr(tagWithSlot(html, "input"), "value")).toBe("255");
    });

    it("reflects controlled value over defaultValue", () => {
      const html = render(() => <RLColorField value="#00ff00" defaultValue="#ff0000" />);
      expect(attr(tagWithSlot(html, "root"), "data-value")).toBe("#00ff00");
    });
  });

  describe("state flags", () => {
    it("omits presence flags when false", () => {
      const root = tagWithSlot(
        render(() => <RLColorField />),
        "root",
      );
      expect(root).not.toMatch(/data-disabled/);
      expect(root).not.toMatch(/data-readonly/);
    });

    it("sets presence flags to an empty value when true", () => {
      const root = tagWithSlot(
        render(() => <RLColorField disabled readonly />),
        "root",
      );
      expect(root).toMatch(/\sdata-disabled(=""|\s|>)/);
      expect(root).toMatch(/\sdata-readonly(=""|\s|>)/);
    });

    it("disables the text input when disabled", () => {
      const input = tagWithSlot(
        render(() => <RLColorField disabled />),
        "input",
      );
      expect(input).toMatch(/\sdisabled(\s|=|>)/);
    });

    it("marks the text input required when required", () => {
      const input = tagWithSlot(
        render(() => <RLColorField required />),
        "input",
      );
      expect(input).toMatch(/\srequired(\s|=|>)/);
    });
  });

  describe("accessibility and forms", () => {
    it("applies kebab-case aria props to the text input", () => {
      const input = tagWithSlot(
        render(() => (
          <RLColorField
            aria-label="Brand color"
            aria-labelledby="brand-label"
            aria-describedby="brand-help"
          />
        )),
        "input",
      );
      expect(attr(input, "aria-label")).toBe("Brand color");
      expect(attr(input, "aria-labelledby")).toBe("brand-label");
      expect(attr(input, "aria-describedby")).toBe("brand-help");
    });

    it("renders no hidden input without name", () => {
      expect(render(() => <RLColorField />)).not.toMatch(/type="hidden"/);
    });

    it("renders a hidden input carrying the hex value when name is set", () => {
      const html = render(() => <RLColorField name="brand" defaultValue="#ff0000" />);
      const input = html.match(/<input[^>]*type="hidden"[^>]*>/)?.[0] ?? "";
      expect(attr(input, "name")).toBe("brand");
      expect(attr(input, "value")).toBe("#ff0000");
    });
  });
});
