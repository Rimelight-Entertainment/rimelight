import { describe, it, expect, vi, afterEach } from "vite-plus/test";
import { flush } from "solid-js";
import { render } from "@solidjs/web";
import { RLTabs } from "../src/components/tabs/RLTabs";

const items = [
  { label: "One", value: "one", content: "Panel one" },
  { label: "Two", value: "two", content: "Panel two" },
  { label: "Three", value: "three", content: "Panel three", disabled: true },
];

const disposers: Array<() => void> = [];

function mount(fn: () => any): HTMLElement {
  const container = document.createElement("div");
  document.body.appendChild(container);
  disposers.push(render(fn, container));
  flush();
  return container;
}

function click(el: HTMLElement | null | undefined): void {
  el?.click();
  flush();
}

const triggers = (c: HTMLElement) => Array.from(c.querySelectorAll<HTMLElement>("[role='tab']"));
const activeValue = (c: HTMLElement) =>
  triggers(c)
    .find((t) => t.getAttribute("data-state") === "active")
    ?.getAttribute("data-value");

afterEach(() => {
  while (disposers.length) disposers.pop()?.();
  document.body.innerHTML = "";
});

describe("RLTabs", () => {
  it("selects a tab on click and reports the value", () => {
    const onValueChange = vi.fn();
    const c = mount(() => <RLTabs items={items} onValueChange={onValueChange} />);
    click(triggers(c)[1]);
    expect(activeValue(c)).toBe("two");
    expect(onValueChange).toHaveBeenCalledWith("two");
  });

  it("keeps the active tab fixed when controlled by value", () => {
    const onValueChange = vi.fn();
    const c = mount(() => <RLTabs items={items} value="one" onValueChange={onValueChange} />);
    click(triggers(c)[1]);
    expect(onValueChange).toHaveBeenCalledWith("two");
    expect(activeValue(c)).toBe("one");
  });

  it("does not select a disabled tab", () => {
    const onValueChange = vi.fn();
    const c = mount(() => <RLTabs items={items} onValueChange={onValueChange} />);
    click(triggers(c)[2]);
    expect(onValueChange).not.toHaveBeenCalled();
    expect(activeValue(c)).toBe("one");
  });

  it("moves tabs beyond maxTabs into the overflow menu", () => {
    const onValueChange = vi.fn();
    const many = [
      { label: "A", value: "a" },
      { label: "B", value: "b" },
      { label: "C", value: "c" },
      { label: "D", value: "d" },
    ];
    const c = mount(() => <RLTabs items={many} maxTabs={2} onValueChange={onValueChange} />);
    expect(triggers(c)).toHaveLength(2);

    const overflowTrigger = c.querySelector<HTMLButtonElement>("[data-slot='overflow-trigger']");
    expect(overflowTrigger?.textContent).toContain("2");
    click(overflowTrigger);

    const overflowItems = Array.from(
      c.querySelectorAll<HTMLButtonElement>("[data-slot='overflow-item']"),
    );
    expect(overflowItems.map((b) => b.textContent?.trim())).toEqual(["C", "D"]);
    click(overflowItems[1]);
    expect(onValueChange).toHaveBeenCalledWith("d");
    expect(c.querySelector("[data-slot='overflow-menu']")).toBeNull();
  });
});
