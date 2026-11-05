import { describe, it, expect } from "vite-plus/test";
import { mountComponent } from "./utils/browser-render";
import { RLHeader } from "../src/components/header/RLHeader";

describe("RLHeader", () => {
  it("renders the root with leading, center and trailing regions", () => {
    const container = mountComponent(() => (
      <RLHeader leadingSlot={<span>L</span>} trailingSlot={<span>T</span>}>
        C
      </RLHeader>
    ));
    const root = container.querySelector("[data-slot='root']");
    expect(root?.tagName.toLowerCase()).toBe("header");
    expect(container.querySelector("[data-slot='leading']")?.textContent).toContain("L");
    expect(container.querySelector("[data-slot='trailing']")?.textContent).toContain("T");
  });

  it("uses children as the center content when centerSlot is omitted", () => {
    const container = mountComponent(() => <RLHeader>Children</RLHeader>);
    expect(container.querySelector("[data-slot='center']")?.textContent).toContain("Children");
  });

  it("replaces children with centerSlot when provided", () => {
    const container = mountComponent(() => (
      <RLHeader centerSlot={<span>Slot</span>}>Children</RLHeader>
    ));
    const center = container.querySelector("[data-slot='center']");
    expect(center?.textContent).toContain("Slot");
    expect(center?.textContent).not.toContain("Children");
  });

  it("marks containment with a presence flag only when contained", () => {
    const contained = mountComponent(() => <RLHeader>x</RLHeader>);
    const root = contained.querySelector("[data-slot='root']");
    expect(root?.hasAttribute("data-contain")).toBe(true);
    expect(root?.getAttribute("data-contain")).toBe("");

    const open = mountComponent(() => <RLHeader contain={false}>x</RLHeader>);
    expect(open.querySelector("[data-slot='root']")?.hasAttribute("data-contain")).toBe(false);
  });

  it("marks banner layers with data-rl-banner and header layers with data-rl-header", () => {
    const header = mountComponent(() => <RLHeader>x</RLHeader>);
    const headerRoot = header.querySelector("[data-slot='root']");
    expect(headerRoot?.hasAttribute("data-rl-header")).toBe(true);
    expect(headerRoot?.hasAttribute("data-rl-banner")).toBe(false);

    const banner = mountComponent(() => <RLHeader layerType="banner">x</RLHeader>);
    const bannerRoot = banner.querySelector("[data-slot='root']");
    expect(bannerRoot?.hasAttribute("data-rl-banner")).toBe(true);
    expect(bannerRoot?.hasAttribute("data-rl-header")).toBe(false);
    expect(bannerRoot?.getAttribute("data-layer-type")).toBe("banner");
  });

  it("exposes the stack index", () => {
    const container = mountComponent(() => <RLHeader stackIndex={2}>x</RLHeader>);
    expect(container.querySelector("[data-slot='root']")?.getAttribute("data-stack-index")).toBe(
      "2",
    );
  });

  it("forwards id to the root", () => {
    const container = mountComponent(() => <RLHeader id="site-header">x</RLHeader>);
    expect(container.querySelector("#site-header")?.getAttribute("data-slot")).toBe("root");
  });
});
