import { describe, it, expect, vi, afterEach } from "vite-plus/test";
import { flush } from "solid-js";
import { render } from "@solidjs/web";
import { RLStepper } from "../src/components/stepper/RLStepper";

const steps = [
  { title: "Account" },
  { title: "Billing", content: "Pay here" },
  { title: "Review", content: "Check everything" },
];

const disposers: Array<() => void> = [];

function mount(fn: () => any): HTMLElement {
  const container = document.createElement("div");
  document.body.appendChild(container);
  disposers.push(render(fn, container));
  flush();
  return container;
}

function click(el: HTMLElement | null | undefined): void {
  el?.click();
  flush();
}

function triggersOf(container: HTMLElement): HTMLButtonElement[] {
  return Array.from(container.querySelectorAll<HTMLButtonElement>('[data-slot="trigger"]'));
}

function statesOf(container: HTMLElement): (string | null)[] {
  return Array.from(container.querySelectorAll('[data-slot="item"]')).map((item) =>
    item.getAttribute("data-state"),
  );
}

afterEach(() => {
  while (disposers.length) disposers.pop()?.();
  document.body.innerHTML = "";
});

describe("RLStepper", () => {
  it("moves back to an earlier step and reports it", () => {
    const onValueChange = vi.fn();
    const onPrev = vi.fn();
    const container = mount(() => (
      <RLStepper items={steps} defaultValue={1} onValueChange={onValueChange} onPrev={onPrev} />
    ));

    click(triggersOf(container)[0]);

    expect(onValueChange).toHaveBeenCalledWith(0);
    expect(onPrev).toHaveBeenCalledWith({ index: 0, value: 0 });
    expect(statesOf(container)).toEqual(["active", "inactive", "inactive"]);
  });

  it("moves forward one step at a time when linear", () => {
    const onValueChange = vi.fn();
    const onNext = vi.fn();
    const container = mount(() => (
      <RLStepper items={steps} onValueChange={onValueChange} onNext={onNext} />
    ));

    click(triggersOf(container)[2]);
    expect(onValueChange).not.toHaveBeenCalled();

    click(triggersOf(container)[1]);
    expect(onValueChange).toHaveBeenCalledWith(1);
    expect(onNext).toHaveBeenCalledWith({ index: 1, value: 1 });
  });

  it("allows skipping ahead when linear is false", () => {
    const onValueChange = vi.fn();
    const container = mount(() => (
      <RLStepper items={steps} linear={false} onValueChange={onValueChange} />
    ));

    click(triggersOf(container)[2]);
    expect(onValueChange).toHaveBeenCalledWith(2);
  });

  it("disables every trigger when disabled", () => {
    const onValueChange = vi.fn();
    const container = mount(() => (
      <RLStepper items={steps} disabled onValueChange={onValueChange} />
    ));

    expect(triggersOf(container).every((trigger) => trigger.disabled)).toBe(true);
    click(triggersOf(container)[0]);
    expect(onValueChange).not.toHaveBeenCalled();
  });
});
