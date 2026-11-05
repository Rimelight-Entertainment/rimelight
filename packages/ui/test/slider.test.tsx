import { describe, expect, it } from "vite-plus/test";
import { RLSlider } from "../src/components/slider/RLSlider";
import { mountComponent } from "./utils/browser-render";

const getInput = (container: HTMLElement) =>
  container.querySelector<HTMLInputElement>("input[type='range']")!;

describe("RLSlider", () => {
  it("starts at defaultValue when uncontrolled", () => {
    const container = mountComponent(() => <RLSlider defaultValue={25} aria-label="Volume" />);
    expect(getInput(container).value).toBe("25");
  });

  it("forwards aria-label to the native input", () => {
    const container = mountComponent(() => <RLSlider aria-label="Brightness" />);
    expect(getInput(container).getAttribute("aria-label")).toBe("Brightness");
  });

  it("disables the native input and marks the root when disabled", () => {
    const container = mountComponent(() => <RLSlider disabled aria-label="Volume" />);
    expect(getInput(container).disabled).toBe(true);
    const root = container.querySelector("[data-slot='root']");
    expect(root?.hasAttribute("data-disabled")).toBe(true);
  });

  it("exposes the orientation on the root", () => {
    const container = mountComponent(() => <RLSlider orientation="vertical" aria-label="Volume" />);
    const root = container.querySelector("[data-slot='root']");
    expect(root?.getAttribute("data-orientation")).toBe("vertical");
  });
});
