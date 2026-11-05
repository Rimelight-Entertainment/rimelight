import { describe, it, expect } from "vite-plus/test";
import { mountComponent } from "./utils/browser-render";
import { RLDashboardPanel } from "../src/components/dashboard-panel/RLDashboardPanel";

describe("RLDashboardPanel", () => {
  it("renders children as the body when bodySlot is omitted", () => {
    const container = mountComponent(() => <RLDashboardPanel>Body text</RLDashboardPanel>);
    expect(container.querySelector("[data-slot='body']")?.textContent).toContain("Body text");
  });

  it("replaces children with bodySlot when provided", () => {
    const container = mountComponent(() => (
      <RLDashboardPanel bodySlot={<span>Slot body</span>}>Children</RLDashboardPanel>
    ));
    const body = container.querySelector("[data-slot='body']");
    expect(body?.textContent).toContain("Slot body");
    expect(body?.textContent).not.toContain("Children");
  });

  it("renders header and footer only when provided", () => {
    const bare = mountComponent(() => <RLDashboardPanel>x</RLDashboardPanel>);
    expect(bare.querySelector("[data-slot='header']")).toBeNull();
    expect(bare.querySelector("[data-slot='footer']")).toBeNull();

    const full = mountComponent(() => (
      <RLDashboardPanel headerSlot={<span>H</span>} footerSlot={<span>F</span>}>
        x
      </RLDashboardPanel>
    ));
    expect(full.querySelector("[data-slot='header']")?.textContent).toContain("H");
    expect(full.querySelector("[data-slot='footer']")?.textContent).toContain("F");
  });

  it("renders no resize handle by default", () => {
    const container = mountComponent(() => <RLDashboardPanel>x</RLDashboardPanel>);
    expect(container.querySelector("[data-slot='handle']")).toBeNull();
  });

  it("renders the default handle when resizable and handleSlot is omitted", () => {
    const container = mountComponent(() => <RLDashboardPanel resizable>x</RLDashboardPanel>);
    expect(container.querySelector("[data-slot='handle']")).not.toBeNull();
  });

  it("replaces the default handle with handleSlot when resizable", () => {
    const container = mountComponent(() => (
      <RLDashboardPanel resizable handleSlot={<span class="custom-grip">Grip</span>}>
        x
      </RLDashboardPanel>
    ));
    expect(container.querySelector("[data-slot='handle']")).toBeNull();
    expect(container.querySelector(".custom-grip")).not.toBeNull();
  });
});
