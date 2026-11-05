import { describe, it, expect } from "vite-plus/test";
import { mountComponent } from "./utils/browser-render";
import { RLLabel } from "../src/components/label/RLLabel";

describe("RLLabel", () => {
  it("renders a label element", () => {
    const root = mountComponent(() => <RLLabel>Email</RLLabel>);
    expect(root.querySelector("label")?.textContent).toBe("Email");
  });

  it("associates with a form control through the for prop", () => {
    const root = mountComponent(() => <RLLabel for="email-field">Email</RLLabel>);
    expect(root.querySelector("label")?.getAttribute("for")).toBe("email-field");
  });

  it("omits the for attribute when no control id is given", () => {
    const root = mountComponent(() => <RLLabel>Email</RLLabel>);
    expect(root.querySelector("label")?.hasAttribute("for")).toBe(false);
  });

  it("renders element children inside the label", () => {
    const root = mountComponent(() => (
      <RLLabel for="name">
        <span>Full name</span>
      </RLLabel>
    ));
    expect(root.querySelector("label span")?.textContent).toBe("Full name");
  });
});
