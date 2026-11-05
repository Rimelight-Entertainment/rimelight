import { afterEach, describe, expect, it, vi } from "vite-plus/test";
import { flush } from "solid-js";
import { render } from "@solidjs/web";
import { RLToast } from "../src/components/toast/RLToast";

const disposers: Array<() => void> = [];

function mount(fn: () => any): HTMLElement {
  const container = document.createElement("div");
  document.body.appendChild(container);
  disposers.push(render(fn, container));
  flush();
  return container;
}

const root = (container: HTMLElement) => container.querySelector<HTMLElement>('[data-slot="root"]');

afterEach(() => {
  while (disposers.length) disposers.pop()?.();
  document.body.innerHTML = "";
  vi.useRealTimers();
});

describe("RLToast", () => {
  it("closes on the close button and calls onDismiss after the exit delay", () => {
    vi.useFakeTimers();
    const onDismiss = vi.fn();
    const container = mount(() => <RLToast title="Hi" duration={0} onDismiss={onDismiss} />);

    container.querySelector<HTMLButtonElement>("button")?.click();
    flush();

    expect(root(container)?.getAttribute("data-state")).toBe("closed");
    expect(onDismiss).not.toHaveBeenCalled();
    vi.advanceTimersByTime(300);
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it("dismisses automatically after duration elapses", () => {
    vi.useFakeTimers();
    const container = mount(() => <RLToast title="Hi" duration={1000} />);

    expect(root(container)?.getAttribute("data-state")).toBe("open");
    vi.advanceTimersByTime(1000);
    flush();
    expect(root(container)?.getAttribute("data-state")).toBe("closed");
  });

  it("never auto-dismisses when duration is 0", () => {
    vi.useFakeTimers();
    const container = mount(() => <RLToast title="Sticky" duration={0} />);

    vi.advanceTimersByTime(60_000);
    expect(root(container)?.getAttribute("data-state")).toBe("open");
  });

  it("never auto-dismisses a non-dismissible toast", () => {
    vi.useFakeTimers();
    const container = mount(() => <RLToast title="Consent" duration={1000} dismissible={false} />);

    vi.advanceTimersByTime(60_000);
    expect(root(container)?.getAttribute("data-state")).toBe("open");
  });
});
