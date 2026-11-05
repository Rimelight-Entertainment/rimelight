import { describe, it, expect } from "vite-plus/test";

import { RLCheckbox } from "../src/components/checkbox/RLCheckbox";
import { renderToString } from "@solidjs/web";
import { cleanHtml } from "./utils/normalize";

function render(fn: () => any): string {
  return cleanHtml(renderToString(fn));
}

function hasSlot(html: string, slot: string): boolean {
  return html.includes(`data-slot="${slot}"`);
}

function ariaChecked(html: string): string | undefined {
  return html.match(/aria-checked="([^"]*)"/)?.[1];
}

describe("RLCheckbox", () => {
  it("renders a native checkbox input inside the root", () => {
    const html = render(() => <RLCheckbox label="Accept" />);
    expect(hasSlot(html, "root")).toBe(true);
    expect(html).toContain('type="checkbox"');
  });

  it("reports unchecked, checked and indeterminate through aria-checked", () => {
    expect(ariaChecked(render(() => <RLCheckbox />))).toBe("false");
    expect(ariaChecked(render(() => <RLCheckbox checked />))).toBe("true");
    expect(ariaChecked(render(() => <RLCheckbox indeterminate />))).toBe("mixed");
  });

  it("renders the label prop", () => {
    const html = render(() => <RLCheckbox label="Enable alerts" />);
    expect(hasSlot(html, "label")).toBe(true);
    expect(html).toContain("Enable alerts");
  });

  it("renders the description prop", () => {
    const html = render(() => <RLCheckbox label="A" description="Shown below" />);
    expect(hasSlot(html, "description")).toBe(true);
    expect(html).toContain("Shown below");
  });

  it("renders children as the label when no label prop is given", () => {
    const html = render(() => <RLCheckbox>Child label</RLCheckbox>);
    expect(hasSlot(html, "label")).toBe(true);
    expect(html).toContain("Child label");
  });

  it("omits the label and description when neither is provided", () => {
    const html = render(() => <RLCheckbox />);
    expect(hasSlot(html, "label")).toBe(false);
    expect(hasSlot(html, "description")).toBe(false);
  });

  it("replaces the label with labelSlot receiving the label prop", () => {
    const html = render(() => (
      <RLCheckbox label="Plain" labelSlot={({ label }) => <strong>Slot {label}</strong>} />
    ));
    expect(html).toContain("Slot Plain");
    expect(html).not.toContain(">Plain<");
  });

  it("replaces the description with descriptionSlot receiving the description prop", () => {
    const html = render(() => (
      <RLCheckbox
        label="A"
        description="Plain"
        descriptionSlot={({ description }) => <em>Slot {description}</em>}
      />
    ));
    expect(html).toContain("Slot Plain");
  });

  it("renders the indicator box by default", () => {
    const html = render(() => <RLCheckbox label="A" />);
    expect(hasSlot(html, "indicator")).toBe(true);
  });

  it("omits the indicator box and renders the icon above the label when hasIndicator is false", () => {
    const html = render(() => <RLCheckbox label="A" hasIndicator={false} icon="star" />);
    expect(hasSlot(html, "indicator")).toBe(false);
    expect(hasSlot(html, "wrapper")).toBe(true);
    expect(hasSlot(html, "icon")).toBe(true);
  });

  it("sets the presence flag data-disabled when disabled", () => {
    const html = render(() => <RLCheckbox label="A" disabled />);
    expect(html).toMatch(/data-disabled=""/);
    expect(html).toContain('aria-disabled="true"');
  });

  it("marks the input as required when required is set", () => {
    const html = render(() => <RLCheckbox label="A" required />);
    expect(html).toContain('aria-required="true"');
  });

  it("forwards name and value to the input", () => {
    const html = render(() => <RLCheckbox name="terms" value="yes" />);
    expect(html).toContain('name="terms"');
    expect(html).toContain('value="yes"');
  });
});
