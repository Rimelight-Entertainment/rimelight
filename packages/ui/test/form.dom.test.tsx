import { describe, it, expect, vi, afterEach } from "vite-plus/test";
import { flush } from "solid-js";
import { render } from "@solidjs/web";
import { RLForm } from "../src/components/form/RLForm";

const disposers: Array<() => void> = [];

function mount(fn: () => any): HTMLElement {
  const container = document.createElement("div");
  document.body.appendChild(container);
  disposers.push(render(fn, container));
  flush();
  return container;
}

afterEach(() => {
  while (disposers.length) disposers.pop()?.();
  document.body.innerHTML = "";
});

describe("RLForm", () => {
  it("calls onSubmit when the form is submitted", () => {
    const onSubmit = vi.fn((e: Event) => e.preventDefault());
    const container = mount(() => <RLForm onSubmit={onSubmit} />);
    container
      .querySelector("form")!
      .dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    flush();
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });
});
