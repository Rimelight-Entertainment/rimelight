import { describe, it, expect, vi, afterEach } from "vite-plus/test";
import type { JSX } from "@solidjs/web";
import { flush } from "solid-js";
import { render } from "@solidjs/web";
import { RLInputRating } from "../src/components/input-rating/RLInputRating";

const disposers: Array<() => void> = [];

function mountComponent(fn: () => JSX.Element): HTMLElement {
  const container = document.createElement("div");
  document.body.appendChild(container);
  disposers.push(render(fn, container));
  flush();
  return container;
}

const press = (el: Element, key: string) =>
  el.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true }));

afterEach(() => {
  while (disposers.length) disposers.pop()?.();
  document.body.innerHTML = "";
});

describe("RLInputRating — client interaction", () => {
  it("increments with ArrowRight and reports the next value", () => {
    const onValueChange = vi.fn();
    const container = mountComponent(() => (
      <RLInputRating defaultValue={2} onValueChange={onValueChange} />
    ));
    press(container.querySelector("[role='slider']")!, "ArrowRight");
    expect(onValueChange).toHaveBeenCalledWith(3);
  });

  it("clamps the value at length", () => {
    const onValueChange = vi.fn();
    const container = mountComponent(() => (
      <RLInputRating length={4} defaultValue={4} onValueChange={onValueChange} />
    ));
    press(container.querySelector("[role='slider']")!, "ArrowRight");
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("jumps to the bounds with Home and End", () => {
    const onValueChange = vi.fn();
    const container = mountComponent(() => (
      <RLInputRating length={5} defaultValue={2} onValueChange={onValueChange} />
    ));
    const slider = container.querySelector("[role='slider']")!;
    press(slider, "End");
    expect(onValueChange).toHaveBeenLastCalledWith(5);
    press(slider, "Home");
    expect(onValueChange).toHaveBeenLastCalledWith(0);
  });

  it("ignores keys while readonly", () => {
    const onValueChange = vi.fn();
    const container = mountComponent(() => (
      <RLInputRating readonly defaultValue={2} onValueChange={onValueChange} />
    ));
    press(container.querySelector("[role='slider']")!, "ArrowRight");
    expect(onValueChange).not.toHaveBeenCalled();
  });
});
