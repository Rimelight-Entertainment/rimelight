import { describe, it, expect } from "vite-plus/test";
import { mountComponent } from "./utils/browser-render";
import { RLDashboardSidebar } from "../src/components/dashboard-sidebar/RLDashboardSidebar";

const root = (container: HTMLElement) =>
  container.querySelector<HTMLElement>("[data-slot='root']") as HTMLElement;

describe("RLDashboardSidebar", () => {
  it("attaches to the left edge by default and to the right when side is right", () => {
    const left = mountComponent(() => <RLDashboardSidebar>x</RLDashboardSidebar>);
    expect(root(left).getAttribute("data-side")).toBe("left");

    const right = mountComponent(() => <RLDashboardSidebar side="right">x</RLDashboardSidebar>);
    expect(root(right).getAttribute("data-side")).toBe("right");
  });

  it("renders children inside the body", () => {
    const container = mountComponent(() => <RLDashboardSidebar>Nav links</RLDashboardSidebar>);
    expect(container.querySelector("[data-slot='body']")?.textContent).toContain("Nav links");
  });

  it("renders header and footer only when provided", () => {
    const bare = mountComponent(() => <RLDashboardSidebar>x</RLDashboardSidebar>);
    expect(bare.querySelector("[data-slot='header']")).toBeNull();
    expect(bare.querySelector("[data-slot='footer']")).toBeNull();

    const full = mountComponent(() => (
      <RLDashboardSidebar headerSlot={<span>Top</span>} footerSlot={<span>Bottom</span>}>
        x
      </RLDashboardSidebar>
    ));
    expect(full.querySelector("[data-slot='header']")?.textContent).toContain("Top");
    expect(full.querySelector("[data-slot='footer']")?.textContent).toContain("Bottom");
  });

  it("is not collapsible and not collapsed by default", () => {
    const container = mountComponent(() => <RLDashboardSidebar>x</RLDashboardSidebar>);
    expect(root(container).hasAttribute("data-collapsible")).toBe(false);
    expect(root(container).hasAttribute("data-collapsed")).toBe(false);
  });

  it("flags collapsed with a presence attribute when collapsible and collapsed", () => {
    const container = mountComponent(() => (
      <RLDashboardSidebar collapsible collapsed>
        x
      </RLDashboardSidebar>
    ));
    expect(root(container).hasAttribute("data-collapsible")).toBe(true);
    expect(root(container).getAttribute("data-collapsed")).toBe("");
  });

  it("ignores collapsed when the sidebar is not collapsible", () => {
    const container = mountComponent(() => <RLDashboardSidebar collapsed>x</RLDashboardSidebar>);
    expect(root(container).hasAttribute("data-collapsed")).toBe(false);
  });
});
