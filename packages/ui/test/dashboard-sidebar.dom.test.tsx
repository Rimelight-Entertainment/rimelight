import { describe, it, expect, vi, afterEach } from "vite-plus/test";
import { flush } from "solid-js";
import { render } from "@solidjs/web";
import { RLDashboardSidebar } from "../src/components/dashboard-sidebar/RLDashboardSidebar";

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

describe("RLDashboardSidebar", () => {
  it("closes the mobile drawer when the overlay is clicked", () => {
    const onOpenMobileChange = vi.fn();
    const container = mount(() => (
      <RLDashboardSidebar openMobile onOpenMobileChange={onOpenMobileChange}>
        x
      </RLDashboardSidebar>
    ));
    (container.querySelector("[data-slot='overlay']") as HTMLElement).click();
    flush();
    expect(onOpenMobileChange).toHaveBeenCalledWith(false);
  });
});
