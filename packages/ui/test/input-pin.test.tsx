import { describe, it, expect } from "vite-plus/test";

import { RLInputPin } from "../src/components/input-pin/RLInputPin";
import { renderToString } from "@solidjs/web";
import { cleanHtml } from "./utils/normalize";

function render(fn: () => any): string {
  return cleanHtml(renderToString(fn));
}

function slotTags(html: string, slot: string): string[] {
  const pattern = new RegExp(`<[a-z0-9]+[^>]*data-slot="${slot}"[^>]*>`, "g");
  return [...html.matchAll(pattern)].map((match) => match[0]);
}

function attr(tag: string, name: string): string | undefined {
  return tag.match(new RegExp(`\\s${name}="([^"]*)"`))?.[1];
}

describe("RLInputPin", () => {
  describe("Cells", () => {
    it("renders four cells by default", () => {
      const html = render(() => <RLInputPin />);

      expect(slotTags(html, "cell")).toHaveLength(4);
      expect(slotTags(html, "input")).toHaveLength(4);
    });

    it("renders one cell per requested length", () => {
      const html = render(() => <RLInputPin length={6} />);

      expect(slotTags(html, "cell")).toHaveLength(6);
    });

    it("distributes the controlled value across the cells in order", () => {
      const html = render(() => <RLInputPin length={4} value="12" />);
      const inputs = slotTags(html, "input");

      expect(attr(inputs[0]!, "value")).toBe("1");
      expect(attr(inputs[1]!, "value")).toBe("2");
      expect(attr(inputs[2]!, "value")).toBe("");
      expect(attr(inputs[3]!, "value")).toBe("");
    });

    it("uses the defaultValue when uncontrolled", () => {
      const html = render(() => <RLInputPin length={3} defaultValue="9" />);
      const inputs = slotTags(html, "input");

      expect(attr(inputs[0]!, "value")).toBe("9");
    });

    it("names each cell from the name prop", () => {
      const html = render(() => <RLInputPin length={2} name="otp" />);
      const inputs = slotTags(html, "input");

      expect(attr(inputs[0]!, "name")).toBe("otp-0");
      expect(attr(inputs[1]!, "name")).toBe("otp-1");
    });
  });

  describe("Disabled and required", () => {
    it("disables every cell input when disabled", () => {
      const html = render(() => <RLInputPin length={3} disabled />);

      for (const input of slotTags(html, "input")) {
        expect(input).toMatch(/\sdisabled(=""|\s|>)/);
      }
    });

    it("leaves cells enabled by default", () => {
      const html = render(() => <RLInputPin length={3} />);

      for (const input of slotTags(html, "input")) {
        expect(input).not.toMatch(/\sdisabled(=""|\s|>)/);
      }
    });
  });

  describe("Accessibility", () => {
    it("applies aria-label to the group", () => {
      const html = render(() => <RLInputPin aria-label="Verification code" />);
      const group = slotTags(html, "group")[0]!;

      expect(attr(group, "aria-label")).toBe("Verification code");
    });

    it("applies aria-labelledby and aria-describedby to the group", () => {
      const html = render(() => (
        <RLInputPin aria-labelledby="heading-id" aria-describedby="hint-id" />
      ));
      const group = slotTags(html, "group")[0]!;

      expect(attr(group, "aria-labelledby")).toBe("heading-id");
      expect(attr(group, "aria-describedby")).toBe("hint-id");
    });

    it("gives each cell its own digit label", () => {
      const html = render(() => <RLInputPin length={2} />);
      const inputs = slotTags(html, "input");

      expect(attr(inputs[0]!, "aria-label")).not.toBe(attr(inputs[1]!, "aria-label"));
    });
  });
});
