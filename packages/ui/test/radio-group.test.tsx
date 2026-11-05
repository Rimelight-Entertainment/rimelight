import { describe, expect, it } from "vite-plus/test";
import { RLRadioGroup } from "../src/components/radio-group/RLRadioGroup";
import { mountComponent } from "./utils/browser-render";

const ITEMS = [
  { value: "a", label: "Alpha" },
  { value: "b", label: "Bravo", description: "Second option" },
  { value: "c", label: "Charlie", disabled: true },
];

const getInputs = (container: HTMLElement) =>
  Array.from(container.querySelectorAll<HTMLInputElement>("input[type='radio']"));

describe("RLRadioGroup", () => {
  it("renders one native radio per item and labels it", () => {
    const container = mountComponent(() => <RLRadioGroup items={ITEMS} aria-label="Choice" />);
    expect(getInputs(container)).toHaveLength(3);
    expect(container.textContent).toContain("Alpha");
    expect(container.textContent).toContain("Second option");
  });

  it("selects the default value", () => {
    const container = mountComponent(() => (
      <RLRadioGroup items={ITEMS} defaultValue="b" aria-label="Choice" />
    ));
    const inputs = getInputs(container);
    expect(inputs[1]?.checked).toBe(true);
    expect(inputs[0]?.checked).toBe(false);
  });

  it("disables only the item marked disabled", () => {
    const container = mountComponent(() => <RLRadioGroup items={ITEMS} aria-label="Choice" />);
    const inputs = getInputs(container);
    expect(inputs[0]?.disabled).toBe(false);
    expect(inputs[2]?.disabled).toBe(true);
  });

  it("gives every option the same name so the browser groups them", () => {
    const container = mountComponent(() => <RLRadioGroup items={ITEMS} aria-label="Choice" />);
    const names = new Set(getInputs(container).map((input) => input.name));
    expect(names.size).toBe(1);
    expect(names.values().next().value).not.toBe("");
  });
});
