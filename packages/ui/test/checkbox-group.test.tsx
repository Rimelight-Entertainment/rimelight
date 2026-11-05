import { describe, it, expect } from "vite-plus/test";

import { RLCheckboxGroup } from "../src/components/checkbox-group/RLCheckboxGroup";
import { renderToString } from "@solidjs/web";
import { cleanHtml } from "./utils/normalize";

function render(fn: () => any): string {
  return cleanHtml(renderToString(fn));
}

function hasSlot(html: string, slot: string): boolean {
  return html.includes(`data-slot="${slot}"`);
}

function ariaCheckedList(html: string): string[] {
  return [...html.matchAll(/aria-checked="([^"]*)"/g)].map((m) => m[1] ?? "");
}

function itemCount(html: string): number {
  return [...html.matchAll(/data-slot="item"/g)].length;
}

describe("RLCheckboxGroup", () => {
  it("renders one checkbox per string item", () => {
    const html = render(() => <RLCheckboxGroup items={["a", "b", "c"]} />);
    expect(itemCount(html)).toBe(3);
    expect(ariaCheckedList(html)).toEqual(["false", "false", "false"]);
  });

  it("checks the items present in the value array", () => {
    const html = render(() => <RLCheckboxGroup items={["a", "b", "c"]} value={["b"]} />);
    expect(ariaCheckedList(html)).toEqual(["false", "true", "false"]);
  });

  it("checks the items present in defaultValue when uncontrolled", () => {
    const html = render(() => <RLCheckboxGroup items={["a", "b"]} defaultValue={["a"]} />);
    expect(ariaCheckedList(html)).toEqual(["true", "false"]);
  });

  it("reads value, label and description from object items using the configured keys", () => {
    const html = render(() => (
      <RLCheckboxGroup
        items={[
          { id: "1", name: "First", detail: "one" },
          { id: "2", name: "Second", detail: "two" },
        ]}
        valueKey="id"
        labelKey="name"
        descriptionKey="detail"
        value={["2"]}
      />
    ));
    expect(html).toContain("First");
    expect(html).toContain("Second");
    expect(html).toContain("two");
    expect(ariaCheckedList(html)).toEqual(["false", "true"]);
  });

  it("renders the legend prop", () => {
    const html = render(() => <RLCheckboxGroup legend="Channels" items={["a"]} />);
    expect(hasSlot(html, "legend")).toBe(true);
    expect(html).toContain("Channels");
  });

  it("replaces the legend with legendSlot", () => {
    const html = render(() => (
      <RLCheckboxGroup legend="Ignored" legendSlot={() => <span>Slot legend</span>} items={["a"]} />
    ));
    expect(html).toContain("Slot legend");
    expect(html).not.toContain("Ignored");
  });

  it("omits the legend when neither legend nor legendSlot is provided", () => {
    const html = render(() => <RLCheckboxGroup items={["a"]} />);
    expect(hasSlot(html, "legend")).toBe(false);
  });

  it("passes the normalized item to labelSlot", () => {
    const html = render(() => (
      <RLCheckboxGroup
        items={[{ value: "a", label: "Alpha" }]}
        labelSlot={({ item }) => <strong>Slot {item.label}</strong>}
      />
    ));
    expect(html).toContain("Slot Alpha");
  });

  it("passes the normalized item to descriptionSlot", () => {
    const html = render(() => (
      <RLCheckboxGroup
        items={[{ value: "a", label: "Alpha", description: "Plain" }]}
        descriptionSlot={({ item }) => <em>Slot {item.description}</em>}
      />
    ));
    expect(html).toContain("Slot Plain");
  });

  it("disables unchecked items once max is reached", () => {
    const html = render(() => (
      <RLCheckboxGroup items={["a", "b", "c"]} value={["a", "b"]} max={2} />
    ));
    const disabledItems = [...html.matchAll(/data-slot="item"[^>]*aria-disabled="true"/g)];
    expect(disabledItems.length).toBe(1);
  });

  it("disables the group and its items when disabled", () => {
    const html = render(() => <RLCheckboxGroup items={["a", "b"]} disabled />);
    expect(html).toMatch(/data-disabled=""/);
    expect(html.match(/aria-disabled="true"/g)?.length ?? 0).toBeGreaterThanOrEqual(2);
  });

  it("renders children when there are no items", () => {
    const html = render(() => <RLCheckboxGroup>Empty state</RLCheckboxGroup>);
    expect(itemCount(html)).toBe(0);
    expect(html).toContain("Empty state");
  });
});
