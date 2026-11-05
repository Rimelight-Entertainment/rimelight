import { describe, it, expect } from "vite-plus/test";
import { mountComponent } from "./utils/browser-render";
import { RLLinkGroup } from "../src/components/link-group/RLLinkGroup";

describe("RLLinkGroup", () => {
  it("renders one list item per link", () => {
    const container = mountComponent(() => (
      <RLLinkGroup
        links={[
          { href: "/a", label: "Alpha" },
          { href: "/b", label: "Beta" },
        ]}
      />
    ));
    const items = container.querySelectorAll("[data-slot='item']");
    expect(items.length).toBe(2);
    expect(items[0]?.textContent).toContain("Alpha");
  });

  it("accepts a single link object", () => {
    const container = mountComponent(() => (
      <RLLinkGroup links={{ href: "/only", label: "Only" }} />
    ));
    expect(container.querySelectorAll("[data-slot='item']").length).toBe(1);
  });

  it("renders the title as plain text when no href is given", () => {
    const container = mountComponent(() => <RLLinkGroup label="Company" links={[]} />);
    const title = container.querySelector("[data-slot='title']");
    expect(title?.textContent).toContain("Company");
    expect(title?.querySelector("a")).toBeNull();
  });

  it("wraps the title in a link when href is given", () => {
    const container = mountComponent(() => (
      <RLLinkGroup label="Company" href="/company" links={[]} />
    ));
    const titleLink = container.querySelector("[data-slot='title'] a");
    expect(titleLink?.getAttribute("href")).toBe("/company");
  });

  it("replaces the link list with children", () => {
    const container = mountComponent(() => (
      <RLLinkGroup links={[{ href: "/a", label: "Alpha" }]}>
        <li data-custom="">Custom</li>
      </RLLinkGroup>
    ));
    expect(container.querySelector("[data-slot='item']")).toBeNull();
    expect(container.querySelector("[data-custom]")).not.toBeNull();
  });
});
