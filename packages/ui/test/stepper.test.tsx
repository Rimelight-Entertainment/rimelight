import { describe, it, expect } from "vite-plus/test";
import { RLStepper } from "../src/components/stepper/RLStepper";
import { mountComponent } from "./utils/browser-render";

const steps = [
  { title: "Account" },
  { title: "Billing", content: "Pay here" },
  { title: "Review", content: "Check everything" },
];

function triggersOf(container: HTMLElement): HTMLButtonElement[] {
  return Array.from(container.querySelectorAll<HTMLButtonElement>('[data-slot="trigger"]'));
}

function statesOf(container: HTMLElement): (string | null)[] {
  return Array.from(container.querySelectorAll('[data-slot="item"]')).map((item) =>
    item.getAttribute("data-state"),
  );
}

describe("RLStepper", () => {
  it("renders one item per step", () => {
    const container = mountComponent(() => <RLStepper items={steps} />);
    expect(container.querySelectorAll('[data-slot="item"]')).toHaveLength(3);
    expect(container.querySelectorAll('[data-slot="title"]')).toHaveLength(3);
  });

  it("marks steps before the default value as completed and the default as active", () => {
    const container = mountComponent(() => <RLStepper items={steps} defaultValue={1} />);
    expect(statesOf(container)).toEqual(["completed", "active", "inactive"]);
  });

  it("follows the controlled value", () => {
    const container = mountComponent(() => <RLStepper items={steps} value={2} />);
    expect(statesOf(container)).toEqual(["completed", "completed", "active"]);
  });

  it("disables only the step that sets disabled on its item", () => {
    const container = mountComponent(() => (
      <RLStepper
        items={[{ title: "A" }, { title: "B", disabled: true }, { title: "C" }]}
        linear={false}
      />
    ));

    const triggers = triggersOf(container);
    expect(triggers.map((trigger) => trigger.disabled)).toEqual([false, true, false]);
  });

  it("renders indicatorSlot in place of the step number with the step state", () => {
    const container = mountComponent(() => (
      <RLStepper
        items={steps}
        defaultValue={1}
        indicatorSlot={(ctx) => <em class="custom-indicator">{ctx.state}</em>}
      />
    ));

    const indicators = Array.from(container.querySelectorAll(".custom-indicator")).map(
      (node) => node.textContent,
    );
    expect(indicators).toEqual(["completed", "active", "inactive"]);
  });

  it("renders wrapperSlot in place of the title and description", () => {
    const container = mountComponent(() => (
      <RLStepper
        items={steps}
        wrapperSlot={(ctx) => <span class="custom-wrapper">Step {ctx.index + 1}</span>}
      />
    ));

    expect(container.querySelectorAll('[data-slot="title"]')).toHaveLength(0);
    expect(container.querySelectorAll(".custom-wrapper")).toHaveLength(3);
  });

  it("renders children in the body and shows only the active step panel", () => {
    const container = mountComponent(() => (
      <RLStepper items={steps} defaultValue={1}>
        <p>Intro copy</p>
      </RLStepper>
    ));

    const body = container.querySelector('[data-slot="body"]');
    expect(body?.textContent).toContain("Intro copy");

    const panels = Array.from(container.querySelectorAll('[data-slot="panel"]'));
    expect(panels.map((panel) => panel.hasAttribute("hidden"))).toEqual([true, false, true]);
    expect(panels[1]?.textContent).toContain("Pay here");
  });
});
