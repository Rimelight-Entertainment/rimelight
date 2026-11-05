import { describe, it, expect } from "vite-plus/test";
import { mountComponent } from "./utils/browser-render";
import { RLDashboardNavbar } from "../src/components/dashboard-navbar/RLDashboardNavbar";

const toggle = (container: HTMLElement) =>
  container.querySelector("[data-dashboard-toggle='mobile']");

describe("RLDashboardNavbar", () => {
  it("shows the mobile sidebar toggle by default", () => {
    const container = mountComponent(() => <RLDashboardNavbar title="Home" />);
    expect(toggle(container)).not.toBeNull();
  });

  it("hides the toggle when hasToggle is false", () => {
    const container = mountComponent(() => <RLDashboardNavbar title="Home" hasToggle={false} />);
    expect(toggle(container)).toBeNull();
  });

  it("places the toggle in the trailing region when side is right", () => {
    const container = mountComponent(() => <RLDashboardNavbar title="Home" side="right" />);
    expect(
      container.querySelector("[data-slot='trailing'] [data-dashboard-toggle]"),
    ).not.toBeNull();
    expect(container.querySelector("[data-slot='leading'] [data-dashboard-toggle]")).toBeNull();
  });

  it("renders the title text when titleSlot is omitted", () => {
    const container = mountComponent(() => <RLDashboardNavbar title="Overview" />);
    expect(container.querySelector("[data-slot='title']")?.textContent).toContain("Overview");
  });

  it("replaces the title text with titleSlot", () => {
    const container = mountComponent(() => (
      <RLDashboardNavbar title="Overview" titleSlot={<span>Custom title</span>} />
    ));
    const title = container.querySelector("[data-slot='title']");
    expect(title?.textContent).toContain("Custom title");
    expect(title?.textContent).not.toContain("Overview");
  });

  it("renders the icon only when an icon name is given", () => {
    const bare = mountComponent(() => <RLDashboardNavbar title="Home" />);
    expect(bare.querySelector("[data-slot='icon']")).toBeNull();

    const withIcon = mountComponent(() => <RLDashboardNavbar title="Home" icon="home" />);
    expect(withIcon.querySelector("[data-slot='icon']")).not.toBeNull();
  });

  it("renders children in the center region, and centerSlot in place of children", () => {
    const withChildren = mountComponent(() => (
      <RLDashboardNavbar title="Home">Search here</RLDashboardNavbar>
    ));
    expect(withChildren.querySelector("[data-slot='center']")?.textContent).toContain(
      "Search here",
    );

    const withSlot = mountComponent(() => (
      <RLDashboardNavbar title="Home" centerSlot={<span>Slot center</span>}>
        Ignored
      </RLDashboardNavbar>
    ));
    const center = withSlot.querySelector("[data-slot='center']");
    expect(center?.textContent).toContain("Slot center");
    expect(center?.textContent).not.toContain("Ignored");
  });

  it("renders trailingSlot content in the trailing region", () => {
    const container = mountComponent(() => (
      <RLDashboardNavbar title="Home" trailingSlot={<span>Avatar</span>} />
    ));
    expect(container.querySelector("[data-slot='trailing']")?.textContent).toContain("Avatar");
  });
});
