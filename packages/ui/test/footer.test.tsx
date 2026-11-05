import { describe, expect, it } from "vite-plus/test";
import { RLFooter } from "../src/components/footer/RLFooter";
import { mountComponent } from "./utils/browser-render";

const slot = (container: HTMLElement, name: string) =>
  container.querySelector(`[data-slot='${name}']`);

describe("RLFooter", () => {
  it("renders children in the center region when centerSlot is omitted", () => {
    const container = mountComponent(() => (
      <RLFooter>
        <span>Center child</span>
      </RLFooter>
    ));
    expect(slot(container, "center")?.textContent).toContain("Center child");
  });

  it("renders centerSlot in place of children", () => {
    const container = mountComponent(() => (
      <RLFooter centerSlot={<span>Center slot</span>}>
        <span>Ignored child</span>
      </RLFooter>
    ));
    expect(slot(container, "center")?.textContent).toContain("Center slot");
    expect(container.textContent).not.toContain("Ignored child");
  });

  it("renders leadingSlot and trailingSlot in their regions", () => {
    const container = mountComponent(() => (
      <RLFooter leadingSlot={<span>Lead</span>} trailingSlot={<span>Trail</span>} />
    ));
    expect(slot(container, "leading")?.textContent).toContain("Lead");
    expect(slot(container, "trailing")?.textContent).toContain("Trail");
  });

  it("renders as a footer element", () => {
    const container = mountComponent(() => <RLFooter />);
    expect(container.querySelector("footer")).not.toBeNull();
  });
});
