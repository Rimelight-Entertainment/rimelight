import { describe, expect, it, vi, afterEach } from "vite-plus/test";
import { flush } from "solid-js";
import { render } from "@solidjs/web";
import { RLTree } from "../src/components/tree/RLTree";
import type { TreeItem } from "../src/components/tree/tree.types";

const items: TreeItem[] = [
  {
    id: "docs",
    label: "Docs",
    icon: "lucide:folder",
    children: [{ id: "intro", label: "Intro" }],
  },
  { id: "locked", label: "Locked", disabled: true },
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

const rowFor = (container: HTMLElement, label: string) =>
  Array.from(container.querySelectorAll<HTMLElement>('[data-slot="row"]')).find(
    (row) => row.querySelector('[data-slot="text"]')?.textContent === label,
  );

const labelButton = (container: HTMLElement, label: string) =>
  rowFor(container, label)?.querySelector<HTMLButtonElement>('[data-slot="label"]');

afterEach(() => {
  while (disposers.length) disposers.pop()?.();
  document.body.innerHTML = "";
});

describe("RLTree", () => {
  it("reports the clicked item id through onValueChange", () => {
    const onValueChange = vi.fn();
    const container = mount(() => <RLTree items={items} onValueChange={onValueChange} />);

    click(labelButton(container, "Docs"));

    expect(onValueChange).toHaveBeenCalledWith("docs");
  });

  it("does not select a disabled item", () => {
    const onValueChange = vi.fn();
    const container = mount(() => <RLTree items={items} onValueChange={onValueChange} />);

    expect(rowFor(container, "Locked")?.hasAttribute("data-disabled")).toBe(true);
    expect(labelButton(container, "Locked")?.disabled).toBe(true);
    click(labelButton(container, "Locked"));

    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("reports expansion changes through onExpandedChange when the toggle is clicked", () => {
    const onExpandedChange = vi.fn();
    const container = mount(() => <RLTree items={items} onExpandedChange={onExpandedChange} />);
    const toggle = rowFor(container, "Docs")?.querySelector<HTMLButtonElement>(
      '[data-slot="toggle"]',
    );

    click(toggle);

    expect(onExpandedChange).toHaveBeenCalledWith(["docs"]);
  });
});
