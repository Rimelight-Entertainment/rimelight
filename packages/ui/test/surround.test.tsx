import { describe, it, expect } from "vite-plus/test";
import { RLSurround } from "../src/components/surround/RLSurround";
import { mountComponent } from "./utils/browser-render";

function rootOf(container: HTMLElement): HTMLElement {
  const root = container.querySelector<HTMLElement>('[data-slot="root"]');
  if (!root) throw new Error("missing root");
  return root;
}

describe("RLSurround", () => {
  it("links to the previous and next pages", () => {
    const container = mountComponent(() => (
      <RLSurround
        prev={{ label: "Introduction", href: "/intro" }}
        next={{ label: "Installation", href: "/install" }}
      />
    ));

    const links = container.querySelectorAll<HTMLAnchorElement>("a[href]");
    expect(links).toHaveLength(2);
    expect(links[0]?.getAttribute("href")).toBe("/intro");
    expect(links[0]?.textContent).toContain("Introduction");
    expect(links[1]?.getAttribute("href")).toBe("/install");
    expect(links[1]?.textContent).toContain("Installation");
  });

  it("renders only the link that is provided", () => {
    const container = mountComponent(() => (
      <RLSurround next={{ label: "Installation", href: "/install" }} />
    ));

    const links = container.querySelectorAll<HTMLAnchorElement>("a[href]");
    expect(links).toHaveLength(1);
    expect(links[0]?.getAttribute("href")).toBe("/install");
  });

  it("is hidden when neither a previous nor a next page is provided", () => {
    const container = mountComponent(() => <RLSurround />);
    expect(rootOf(container).hasAttribute("hidden")).toBe(true);
  });

  it("is visible when at least one page is provided", () => {
    const container = mountComponent(() => (
      <RLSurround prev={{ label: "Introduction", href: "/intro" }} />
    ));
    expect(rootOf(container).hasAttribute("hidden")).toBe(false);
  });
});
