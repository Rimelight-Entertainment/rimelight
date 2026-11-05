import { describe, it, expect } from "vite-plus/test";
import { RLStickySurface } from "../src/components/sticky-surface/RLStickySurface";
import { mountComponent } from "./utils/browser-render";

function rootOf(container: HTMLElement): HTMLElement {
  const root = container.querySelector<HTMLElement>('[data-slot="root"]');
  if (!root) throw new Error("missing root");
  return root;
}

describe("RLStickySurface", () => {
  it("renders its children inside the root", () => {
    const container = mountComponent(() => (
      <RLStickySurface>
        <p>Pinned content</p>
      </RLStickySurface>
    ));
    expect(rootOf(container).textContent).toContain("Pinned content");
  });

  it("uses zero offset and z-index 10 by default", () => {
    const container = mountComponent(() => <RLStickySurface>Content</RLStickySurface>);
    const root = rootOf(container);
    expect(root.style.getPropertyValue("--rl-sticky-top")).toBe("0px");
    expect(root.style.getPropertyValue("--rl-sticky-z")).toBe("10");
  });

  it("exposes offsetTop and zIndex as CSS variables", () => {
    const container = mountComponent(() => (
      <RLStickySurface offsetTop={12} zIndex={20}>
        Content
      </RLStickySurface>
    ));
    const root = rootOf(container);
    expect(root.style.getPropertyValue("--rl-sticky-top")).toBe("12px");
    expect(root.style.getPropertyValue("--rl-sticky-z")).toBe("20");
  });

  it("marks the root for the stuck shadow when stuckShadow is set", () => {
    const shadowed = mountComponent(() => <RLStickySurface stuckShadow>Content</RLStickySurface>);
    const plain = mountComponent(() => (
      <RLStickySurface stuckShadow={false}>Content</RLStickySurface>
    ));

    expect(rootOf(shadowed).classList.contains("rl-sticky-shadow")).toBe(true);
    expect(rootOf(plain).classList.contains("rl-sticky-shadow")).toBe(false);
  });
});
