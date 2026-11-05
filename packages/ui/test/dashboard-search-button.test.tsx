import { describe, it, expect } from "vite-plus/test";
import { mountComponent } from "./utils/browser-render";
import { RLDashboardSearchButton } from "../src/components/dashboard-search-button/RLDashboardSearchButton";

describe("RLDashboardSearchButton", () => {
  it("renders a button with the dashboard search hook", () => {
    const container = mountComponent(() => <RLDashboardSearchButton />);
    const root = container.querySelector("[data-slot='root']");
    expect(root?.tagName.toLowerCase()).toBe("button");
    expect(root?.getAttribute("type")).toBe("button");
    expect(root?.hasAttribute("data-dashboard-search-button")).toBe(true);
  });

  it("renders the default shortcut hints", () => {
    const container = mountComponent(() => <RLDashboardSearchButton />);
    expect(container.querySelectorAll("[data-slot='kbd']").length).toBe(2);
  });

  it("renders one hint per entry in kbds, accepting strings and objects", () => {
    const container = mountComponent(() => (
      <RLDashboardSearchButton kbds={["shift", { value: "p" }]} />
    ));
    const hints = Array.from(container.querySelectorAll("[data-slot='kbd']")).map(
      (el) => el.textContent,
    );
    expect(hints.length).toBe(2);
    expect(hints[1]).toBe("p");
  });

  it("omits the shortcut hints when kbds is empty", () => {
    const container = mountComponent(() => <RLDashboardSearchButton kbds={[]} />);
    expect(container.querySelector("[data-slot='kbds']")).toBeNull();
  });

  it("replaces the shortcut hints with trailingSlot", () => {
    const container = mountComponent(() => (
      <RLDashboardSearchButton trailingSlot={<span class="custom-trailing">!</span>} />
    ));
    expect(container.querySelector("[data-slot='kbds']")).toBeNull();
    expect(container.querySelector(".custom-trailing")).not.toBeNull();
  });

  it("renders the label prop as the visible text", () => {
    const container = mountComponent(() => <RLDashboardSearchButton label="Find things" />);
    expect(container.querySelector("[data-slot='label']")?.textContent).toBe("Find things");
  });
});
