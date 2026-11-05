import { describe, expect, it, vi, afterEach } from "vite-plus/test";
import type { JSX } from "@solidjs/web";
import { flush } from "solid-js";
import { render } from "@solidjs/web";
import { RLRadioGroup } from "../src/components/radio-group/RLRadioGroup";

const disposers: Array<() => void> = [];

function mountComponent(fn: () => JSX.Element): HTMLElement {
  const container = document.createElement("div");
  document.body.appendChild(container);
  disposers.push(render(fn, container));
  flush();
  return container;
}

const ITEMS = [
  { value: "a", label: "Alpha" },
  { value: "b", label: "Bravo", description: "Second option" },
  { value: "c", label: "Charlie", disabled: true },
];

const getInputs = (container: HTMLElement) =>
  Array.from(container.querySelectorAll<HTMLInputElement>("input[type='radio']"));

afterEach(() => {
  while (disposers.length) disposers.pop()?.();
  document.body.innerHTML = "";
});

describe("RLRadioGroup — client interaction", () => {
  it("reports the selected value through onValueChange", () => {
    const onValueChange = vi.fn();
    const container = mountComponent(() => (
      <RLRadioGroup
        items={ITEMS}
        defaultValue="a"
        onValueChange={onValueChange}
        aria-label="Choice"
      />
    ));
    const inputs = getInputs(container);
    inputs[1]?.click();
    expect(onValueChange).toHaveBeenCalledWith("b");
    expect(inputs[1]?.checked).toBe(true);
  });
});
