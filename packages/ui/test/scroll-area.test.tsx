import { describe, expect, it } from "vite-plus/test";
import { RLScrollArea } from "../src/components/scroll-area/RLScrollArea";
import { mountComponent } from "./utils/browser-render";

describe("RLScrollArea", () => {
  it("renders children inside the scrollable area", () => {
    const container = mountComponent(() => (
      <RLScrollArea>
        <p>Scrollable content</p>
      </RLScrollArea>
    ));
    expect(container.textContent).toContain("Scrollable content");
  });

  it("exposes the orientation on the root", () => {
    const container = mountComponent(() => (
      <RLScrollArea orientation="horizontal">
        <p>Wide</p>
      </RLScrollArea>
    ));
    const root = container.querySelector("[data-slot='root']");
    expect(root?.getAttribute("data-orientation")).toBe("horizontal");
  });

  it("sets the fixed height as a CSS variable", () => {
    const container = mountComponent(() => (
      <RLScrollArea height={200}>
        <p>Tall</p>
      </RLScrollArea>
    ));
    const root = container.querySelector<HTMLElement>("[data-slot='root']");
    expect(root?.style.getPropertyValue("--rl-scroll-area-height")).not.toBe("");
  });
});
