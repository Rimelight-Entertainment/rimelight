import { describe, it, expect } from "vite-plus/test";
import { mountComponent } from "./utils/browser-render";
import { RLDashboardToolbar } from "../src/components/dashboard-toolbar/RLDashboardToolbar";

describe("RLDashboardToolbar", () => {
  it("renders leading and trailing regions when no children are given", () => {
    const container = mountComponent(() => (
      <RLDashboardToolbar leadingSlot={<span>Left</span>} trailingSlot={<span>Right</span>} />
    ));
    expect(container.querySelector("[data-slot='leading']")?.textContent).toContain("Left");
    expect(container.querySelector("[data-slot='trailing']")?.textContent).toContain("Right");
  });

  it("renders children in place of the leading and trailing regions", () => {
    const container = mountComponent(() => (
      <RLDashboardToolbar leadingSlot={<span>Left</span>} trailingSlot={<span>Right</span>}>
        <span>Custom</span>
      </RLDashboardToolbar>
    ));
    expect(container.textContent).toContain("Custom");
    expect(container.querySelector("[data-slot='leading']")).toBeNull();
    expect(container.querySelector("[data-slot='trailing']")).toBeNull();
  });

  it("renders the root without a leading or trailing region when both slots are empty", () => {
    const container = mountComponent(() => <RLDashboardToolbar />);
    expect(container.querySelector("[data-slot='root']")).not.toBeNull();
    expect(container.querySelector("[data-slot='leading']")?.textContent?.trim()).toBe("");
    expect(container.querySelector("[data-slot='trailing']")?.textContent?.trim()).toBe("");
  });
});
