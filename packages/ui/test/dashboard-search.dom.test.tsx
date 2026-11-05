import { describe, it, expect, vi, afterEach } from "vite-plus/test";
import { flush } from "solid-js";
import { render } from "@solidjs/web";
import { RLDashboardSearch } from "../src/components/dashboard-search/RLDashboardSearch";

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

describe("RLDashboardSearch", () => {
  it("reports close through onOpenChange when Escape is pressed", () => {
    const onOpenChange = vi.fn();
    mount(() => <RLDashboardSearch open onOpenChange={onOpenChange} />);
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    flush();
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("reports close through onOpenChange when the close button is clicked", () => {
    const onOpenChange = vi.fn();
    const container = mount(() => <RLDashboardSearch open onOpenChange={onOpenChange} />);
    (container.querySelector("[data-slot='close']") as HTMLButtonElement).click();
    flush();
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("toggles open with Ctrl+K", () => {
    const onOpenChange = vi.fn();
    mount(() => <RLDashboardSearch open={false} onOpenChange={onOpenChange} />);
    document.dispatchEvent(
      new KeyboardEvent("keydown", { key: "k", ctrlKey: true, bubbles: true }),
    );
    flush();
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });
});
