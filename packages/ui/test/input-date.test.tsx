import { describe, it, expect } from "vite-plus/test";

import { RLInputDate } from "../src/components/input-date/RLInputDate";
import { renderToString } from "@solidjs/web";
import { cleanHtml } from "./utils/normalize";

function render(fn: () => any): string {
  return cleanHtml(renderToString(fn));
}

function inputTag(html: string): string {
  const match = html.match(/<input[^>]*data-slot="input"[^>]*>/);
  return match?.[0] ?? "";
}

function attr(tag: string, name: string): string | undefined {
  return tag.match(new RegExp(`\\s${name}="([^"]*)"`))?.[1];
}

describe("RLInputDate", () => {
  describe("Value", () => {
    it("renders a native date input", () => {
      const html = render(() => <RLInputDate />);

      expect(attr(inputTag(html), "type")).toBe("date");
    });

    it("renders the controlled value", () => {
      const html = render(() => <RLInputDate value="2024-05-01" />);

      expect(attr(inputTag(html), "value")).toBe("2024-05-01");
    });

    it("renders the defaultValue when uncontrolled", () => {
      const html = render(() => <RLInputDate defaultValue="2023-12-31" />);

      expect(attr(inputTag(html), "value")).toBe("2023-12-31");
    });

    it("prefers value over defaultValue", () => {
      const html = render(() => <RLInputDate value="2024-01-01" defaultValue="2020-01-01" />);

      expect(attr(inputTag(html), "value")).toBe("2024-01-01");
    });
  });

  describe("Constraints and states", () => {
    it("forwards min, max and step to the input", () => {
      const html = render(() => <RLInputDate min="2024-01-01" max="2024-12-31" step={7} />);
      const input = inputTag(html);

      expect(attr(input, "min")).toBe("2024-01-01");
      expect(attr(input, "max")).toBe("2024-12-31");
      expect(attr(input, "step")).toBe("7");
    });

    it("disables the input", () => {
      const html = render(() => <RLInputDate disabled />);

      expect(inputTag(html)).toMatch(/\sdisabled(=""|\s|>)/);
    });

    it("marks the input required", () => {
      const html = render(() => <RLInputDate required />);

      expect(inputTag(html)).toMatch(/\srequired(=""|\s|>)/);
    });
  });

  describe("Accessibility", () => {
    it("applies aria-label, aria-labelledby and aria-describedby to the input", () => {
      const html = render(() => (
        <RLInputDate
          aria-label="Start date"
          aria-labelledby="start-heading"
          aria-describedby="start-hint"
        />
      ));
      const input = inputTag(html);

      expect(attr(input, "aria-label")).toBe("Start date");
      expect(attr(input, "aria-labelledby")).toBe("start-heading");
      expect(attr(input, "aria-describedby")).toBe("start-hint");
    });
  });
});
