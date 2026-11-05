import { describe, it, expect } from "vite-plus/test";

import { RLInputNumber } from "../src/components/input-number/RLInputNumber";
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

describe("RLInputNumber", () => {
  describe("Value", () => {
    it("renders the controlled value on the input", () => {
      const html = render(() => <RLInputNumber value={7} />);

      expect(attr(slotTag(html, "input"), "value")).toBe("7");
    });

    it("renders the defaultValue when uncontrolled", () => {
      const html = render(() => <RLInputNumber defaultValue={3} />);

      expect(attr(slotTag(html, "input"), "value")).toBe("3");
    });

    it("carries min, max and step to the input", () => {
      const html = render(() => <RLInputNumber min={1} max={10} step={2} />);
      const input = slotTag(html, "input");

      expect(attr(input, "min")).toBe("1");
      expect(attr(input, "max")).toBe("10");
      expect(attr(input, "step")).toBe("2");
    });
  });

  describe("States", () => {
    it("disables the input", () => {
      const html = render(() => <RLInputNumber disabled />);

      expect(slotTag(html, "input")).toMatch(/\sdisabled(=""|\s|>)/);
    });

    it("marks the input readonly", () => {
      const html = render(() => <RLInputNumber readonly />);

      expect(slotTag(html, "input")).toMatch(/\sreadonly(=""|\s|>)/);
    });

    it("leaves the input enabled and editable by default", () => {
      const html = render(() => <RLInputNumber />);
      const input = slotTag(html, "input");

      expect(input).not.toMatch(/\sdisabled(=""|\s|>)/);
      expect(input).not.toMatch(/\sreadonly(=""|\s|>)/);
    });
  });

  describe("Slots", () => {
    it("renders the stepper with its increment and decrement controls", () => {
      const html = render(() => <RLInputNumber />);

      expect(slotTag(html, "stepper")).not.toBe("");
      expect(slotTag(html, "increment")).not.toBe("");
      expect(slotTag(html, "decrement")).not.toBe("");
      expect(attr(slotTag(html, "increment"), "type")).toBe("button");
      expect(attr(slotTag(html, "decrement"), "type")).toBe("button");
    });

    it("keeps the input inside the wrapper", () => {
      const html = render(() => <RLInputNumber />);
      const wrapperStart = html.indexOf(slotTag(html, "wrapper"));
      const inputStart = html.indexOf(slotTag(html, "input"));

      expect(wrapperStart).toBeGreaterThanOrEqual(0);
      expect(inputStart).toBeGreaterThan(wrapperStart);
    });
  });

  describe("Accessibility", () => {
    it("applies aria-label, aria-labelledby and aria-describedby to the input", () => {
      const html = render(() => (
        <RLInputNumber
          aria-label="Quantity"
          aria-labelledby="qty-heading"
          aria-describedby="qty-hint"
        />
      ));
      const input = slotTag(html, "input");

      expect(attr(input, "aria-label")).toBe("Quantity");
      expect(attr(input, "aria-labelledby")).toBe("qty-heading");
      expect(attr(input, "aria-describedby")).toBe("qty-hint");
    });
  });
});
