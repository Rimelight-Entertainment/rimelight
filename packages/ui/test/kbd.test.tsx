import { describe, it, expect } from "vite-plus/test";
import { mountComponent } from "./utils/browser-render";
import { RLKbd } from "../src/components/kbd/RLKbd";

describe("RLKbd", () => {
  it("renders its children inside a kbd element", () => {
    const root = mountComponent(() => <RLKbd>Enter</RLKbd>);
    expect(root.querySelector("kbd")?.textContent).toBe("Enter");
  });

  it("renders element children inside the kbd element", () => {
    const root = mountComponent(() => (
      <RLKbd>
        <span>Ctrl</span>
      </RLKbd>
    ));
    expect(root.querySelector("kbd span")?.textContent).toBe("Ctrl");
  });
});
