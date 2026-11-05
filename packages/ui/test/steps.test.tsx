import { describe, it, expect } from "vite-plus/test";
import { RLSteps } from "../src/components/steps/RLSteps";
import { mountComponent } from "./utils/browser-render";

function rootOf(container: HTMLElement): HTMLElement {
  const root = container.querySelector<HTMLElement>('[data-slot="root"]');
  if (!root) throw new Error("missing root");
  return root;
}

describe("RLSteps", () => {
  it("renders children as list items of an ordered list", () => {
    const container = mountComponent(() => (
      <RLSteps>
        <li>Install</li>
        <li>Configure</li>
      </RLSteps>
    ));

    const list = container.querySelector<HTMLOListElement>('ol[data-slot="list"]');
    expect(list).not.toBeNull();
    expect(list?.querySelectorAll("li")).toHaveLength(2);
  });

  it("defaults the size attribute to md", () => {
    const container = mountComponent(() => <RLSteps>Step</RLSteps>);
    expect(rootOf(container).getAttribute("data-size")).toBe("md");
  });

  it("reflects the size prop on the root", () => {
    const container = mountComponent(() => <RLSteps size="lg">Step</RLSteps>);
    expect(rootOf(container).getAttribute("data-size")).toBe("lg");
  });
});
