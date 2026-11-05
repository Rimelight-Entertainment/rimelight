import { describe, expect, it, vi, afterEach } from "vite-plus/test";
import type { JSX } from "@solidjs/web";
import { flush } from "solid-js";
import { render } from "@solidjs/web";
import { RLSlider } from "../src/components/slider/RLSlider";

const disposers: Array<() => void> = [];

function mountComponent(fn: () => JSX.Element): HTMLElement {
  const container = document.createElement("div");
  document.body.appendChild(container);
  disposers.push(render(fn, container));
  flush();
  return container;
}

const getInput = (container: HTMLElement) =>
  container.querySelector<HTMLInputElement>("input[type='range']")!;

afterEach(() => {
  while (disposers.length) disposers.pop()?.();
  document.body.innerHTML = "";
});

describe("RLSlider — client interaction", () => {
  it("reports the new value through onValueChange on input", () => {
    const onValueChange = vi.fn();
    const container = mountComponent(() => (
      <RLSlider defaultValue={10} onValueChange={onValueChange} aria-label="Volume" />
    ));
    const input = getInput(container);
    input.value = "60";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    expect(onValueChange).toHaveBeenCalledWith(60);
  });
});
