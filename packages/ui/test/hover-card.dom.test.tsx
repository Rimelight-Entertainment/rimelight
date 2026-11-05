import { describe, it, expect, vi, afterEach } from "vite-plus/test";
import { flush } from "solid-js";
import { render } from "@solidjs/web";
import { RLHoverCard } from "../src/components/hover-card/RLHoverCard";

const disposers: Array<() => void> = [];

function mount(fn: () => any): HTMLElement {
  const container = document.createElement("div");
  document.body.appendChild(container);
  disposers.push(render(fn, container));
  flush();
  return container;
}

function fire(el: HTMLElement, event: Event): void {
  el.dispatchEvent(event);
  flush();
}

const trigger = (container: HTMLElement) =>
  container.querySelector<HTMLElement>("[data-slot='trigger']") as HTMLElement;
const body = (container: HTMLElement) =>
  container.querySelector<HTMLElement>("[data-slot='body']") as HTMLElement;

afterEach(() => {
  while (disposers.length) disposers.pop()?.();
  document.body.innerHTML = "";
});

describe("RLHoverCard", () => {
  it("starts closed and opens when the trigger receives focus", () => {
    const container = mount(() => <RLHoverCard triggerLabel="Who">Card</RLHoverCard>);
    expect(body(container).getAttribute("data-state")).toBe("closed");
    fire(trigger(container), new FocusEvent("focus"));
    expect(body(container).getAttribute("data-state")).toBe("open");
  });

  it("closes when the trigger loses focus", () => {
    const container = mount(() => <RLHoverCard defaultOpen>Card</RLHoverCard>);
    expect(body(container).getAttribute("data-state")).toBe("open");
    fire(trigger(container), new FocusEvent("blur"));
    expect(body(container).getAttribute("data-state")).toBe("closed");
  });

  it("closes on Escape and reports the change through onOpenChange", () => {
    const onOpenChange = vi.fn();
    const container = mount(() => (
      <RLHoverCard defaultOpen onOpenChange={onOpenChange}>
        Card
      </RLHoverCard>
    ));
    fire(trigger(container), new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    expect(body(container).getAttribute("data-state")).toBe("closed");
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
