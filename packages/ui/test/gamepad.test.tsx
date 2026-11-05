import { describe, it, expect } from "vite-plus/test";
import { mountComponent } from "./utils/browser-render";
import { RLGamepad } from "../src/components/gamepad/RLGamepad";

describe("RLGamepad", () => {
  it("renders one element per controller button", () => {
    const c = mountComponent(() => <RLGamepad />);
    expect(c.querySelectorAll("svg g").length).toBe(16);
  });

  it("fills directly highlighted buttons with highlightColor", () => {
    const c = mountComponent(() => (
      <RLGamepad highlightedButtons={["A"]} highlightColor="rgb(1, 2, 3)" />
    ));
    expect(c.querySelectorAll("svg [fill='rgb(1, 2, 3)']").length).toBe(1);
  });

  it("fills group buttons with the group color and renders a legend entry", () => {
    const c = mountComponent(() => (
      <RLGamepad groups={[{ label: "Confirm", buttons: ["A", "B"], color: "lime" }]} />
    ));
    expect(c.querySelectorAll("svg g [fill='lime']").length).toBe(2);
    expect(c.querySelector("[data-slot=legend-item]")?.textContent).toContain("Confirm");
  });

  it("omits the legend when no group has a label", () => {
    const c = mountComponent(() => (
      <RLGamepad groups={[{ label: "", buttons: ["A"], color: "lime" }]} />
    ));
    expect(c.querySelector("[data-slot=legend]")).toBeNull();
  });

  it("renders a background rect only when backgroundColor is set", () => {
    const plain = mountComponent(() => <RLGamepad />);
    expect(plain.querySelector("svg rect[rx='24']")).toBeNull();

    const tinted = mountComponent(() => <RLGamepad backgroundColor="tomato" />);
    expect(tinted.querySelector("svg rect[rx='24'][fill='tomato']")).not.toBeNull();
  });
});
