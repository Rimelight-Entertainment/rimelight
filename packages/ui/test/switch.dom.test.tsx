import { describe, it, expect, vi, afterEach } from "vite-plus/test";
import { render } from "@solidjs/web";
import { RLSwitch } from "../src/components/switch/RLSwitch";

const disposers: Array<() => void> = [];

function mount(fn: () => any): HTMLElement {
  const container = document.createElement("div");
  document.body.appendChild(container);
  disposers.push(render(fn, container));
  return container;
}

function checkbox(container: HTMLElement): HTMLInputElement {
  const el = container.querySelector<HTMLInputElement>("input[type='checkbox']");
  if (!el) throw new Error("checkbox not rendered");
  return el;
}

afterEach(() => {
  while (disposers.length) disposers.pop()?.();
  document.body.innerHTML = "";
});

describe("RLSwitch — DOM behavior", () => {
  it("starts on when defaultChecked is set", () => {
    expect(checkbox(mount(() => <RLSwitch defaultChecked />)).checked).toBe(true);
  });

  it("reflects a controlled checked value", () => {
    expect(checkbox(mount(() => <RLSwitch checked />)).checked).toBe(true);
  });

  it("reports toggles through onValueChange and onChange", () => {
    const onValueChange = vi.fn();
    const onChange = vi.fn();
    const el = checkbox(
      mount(() => <RLSwitch onValueChange={onValueChange} onChange={onChange} />),
    );

    el.checked = true;
    el.dispatchEvent(new Event("change"));

    expect(onValueChange).toHaveBeenCalledWith(true);
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("tracks state across successive toggles when uncontrolled", () => {
    const onValueChange = vi.fn();
    const el = checkbox(mount(() => <RLSwitch onValueChange={onValueChange} />));

    el.checked = true;
    el.dispatchEvent(new Event("change"));
    el.checked = false;
    el.dispatchEvent(new Event("change"));

    expect(onValueChange.mock.calls.map((call) => call[0])).toEqual([true, false]);
  });

  it("disables the checkbox input", () => {
    expect(checkbox(mount(() => <RLSwitch disabled />)).disabled).toBe(true);
  });

  it("puts aria-label on the checkbox element", () => {
    const el = checkbox(mount(() => <RLSwitch aria-label="Notifications" />));
    expect(el.getAttribute("aria-label")).toBe("Notifications");
  });
});
