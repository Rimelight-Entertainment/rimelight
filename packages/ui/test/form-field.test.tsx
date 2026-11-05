import { describe, it, expect } from "vite-plus/test";

import { RLFormField } from "../src/components/form-field/RLFormField";
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

describe("RLFormField", () => {
  describe("Label", () => {
    it("renders the label text bound to the control id", () => {
      const html = render(() => (
        <RLFormField id="email" label="Email">
          <input id="email" />
        </RLFormField>
      ));
      const label = slotTag(html, "label");

      expect(html).toContain("Email");
      expect(attr(label, "for")).toBe("email");
    });

    it("omits the header when there is no label, hint or label slot", () => {
      const html = render(() => <RLFormField>content</RLFormField>);

      expect(slotTag(html, "header")).toBe("");
    });

    it("shows the required marker only when required", () => {
      const required = render(() => (
        <RLFormField label="Name" required>
          x
        </RLFormField>
      ));
      const optional = render(() => <RLFormField label="Name">x</RLFormField>);

      expect(slotTag(required, "required")).not.toBe("");
      expect(slotTag(optional, "required")).toBe("");
    });

    it("renders labelSlot in place of the label prop", () => {
      const html = render(() => (
        <RLFormField label="Plain label" labelSlot={<span>Custom label</span>}>
          x
        </RLFormField>
      ));

      expect(html).toContain("Custom label");
      expect(html).not.toContain("Plain label");
    });

    it("accepts a render function for labelSlot", () => {
      const html = render(() => (
        <RLFormField labelSlot={() => <span>Rendered label</span>}>x</RLFormField>
      ));

      expect(html).toContain("Rendered label");
    });

    it("renders hintSlot inside the header with the hint data-slot", () => {
      const html = render(() => (
        <RLFormField label="Name" hintSlot={<span>Optional</span>}>
          x
        </RLFormField>
      ));
      const headerStart = html.indexOf(slotTag(html, "header"));

      expect(slotTag(html, "hint")).not.toBe("");
      expect(html.indexOf("Optional")).toBeGreaterThan(headerStart);
    });

    it("omits the hint element when hintSlot is absent", () => {
      const html = render(() => <RLFormField label="Name">x</RLFormField>);

      expect(slotTag(html, "hint")).toBe("");
    });
  });

  describe("Description", () => {
    it("renders the description prop", () => {
      const html = render(() => <RLFormField description="Helps you sign in">x</RLFormField>);

      expect(slotTag(html, "description")).not.toBe("");
      expect(html).toContain("Helps you sign in");
    });

    it("omits the description when none is given", () => {
      const html = render(() => <RLFormField>x</RLFormField>);

      expect(slotTag(html, "description")).toBe("");
    });

    it("renders descriptionSlot in place of the description prop", () => {
      const html = render(() => (
        <RLFormField description="Plain description" descriptionSlot={<em>Rich description</em>}>
          x
        </RLFormField>
      ));

      expect(html).toContain("Rich description");
      expect(html).not.toContain("Plain description");
    });
  });

  describe("Error", () => {
    it("renders the error message when set", () => {
      const html = render(() => <RLFormField error="Required">x</RLFormField>);

      expect(slotTag(html, "error")).not.toBe("");
      expect(html).toContain("Required");
    });

    it("omits the error element when there is no error", () => {
      const html = render(() => <RLFormField>x</RLFormField>);

      expect(slotTag(html, "error")).toBe("");
    });

    it("renders errorSlot in place of the error prop", () => {
      const html = render(() => (
        <RLFormField error="Plain error" errorSlot={<strong>Custom error</strong>}>
          x
        </RLFormField>
      ));

      expect(html).toContain("Custom error");
      expect(html).not.toContain("Plain error");
    });

    it("renders an error slot without an error prop", () => {
      const html = render(() => (
        <RLFormField errorSlot={<strong>Only slot</strong>}>x</RLFormField>
      ));

      expect(slotTag(html, "error")).not.toBe("");
    });
  });

  describe("Help and children", () => {
    it("renders helpSlot below the error message", () => {
      const html = render(() => (
        <RLFormField error="Bad" helpSlot={<span>Try again</span>}>
          x
        </RLFormField>
      ));

      expect(slotTag(html, "help")).not.toBe("");
      expect(html.indexOf("Try again")).toBeGreaterThan(html.indexOf("Bad"));
    });

    it("omits the help wrapper when helpSlot is absent", () => {
      const html = render(() => <RLFormField>x</RLFormField>);

      expect(slotTag(html, "help")).toBe("");
    });

    it("renders children inside the control slot", () => {
      const html = render(() => (
        <RLFormField>
          <input data-testid="control" />
        </RLFormField>
      ));
      const control = slotTag(html, "control");
      const controlStart = html.indexOf(control);

      expect(controlStart).toBeGreaterThanOrEqual(0);
      expect(html.indexOf('data-testid="control"')).toBeGreaterThan(controlStart);
    });
  });
});
