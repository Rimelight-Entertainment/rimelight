import { describe, it, expect } from "vite-plus/test";
import { mountComponent } from "./utils/browser-render";
import { RLDashboardSearch } from "../src/components/dashboard-search/RLDashboardSearch";

describe("RLDashboardSearch", () => {
  it("renders no dialog while closed", () => {
    const container = mountComponent(() => <RLDashboardSearch open={false} />);
    expect(container.querySelector("[data-slot='dialog']")).toBeNull();
  });

  it("renders the dialog with a labelled close button when open", () => {
    const container = mountComponent(() => <RLDashboardSearch open />);
    expect(container.querySelector("[data-slot='dialog']")).not.toBeNull();
    const close = container.querySelector("[data-slot='close']");
    expect(close?.getAttribute("aria-label")).toBeTruthy();
  });
});
