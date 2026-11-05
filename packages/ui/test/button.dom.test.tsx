import { describe, it, expect, vi, afterEach } from "vite-plus/test";
import { flush } from "solid-js";
import { render } from "@solidjs/web";

import { RLButton } from "../src/components/button/RLButton";

const disposers: Array<() => void> = [];

function mount(fn: () => any): HTMLElement {
  const container = document.createElement("div");
  document.body.appendChild(container);
  disposers.push(render(fn, container));
  flush();
  return container;
}

afterEach(() => {
  while (disposers.length) disposers.pop()?.();
  document.body.innerHTML = "";
});

const buttonOf = (container: HTMLElement) => container.querySelector("button") as HTMLButtonElement;

describe("RLButton", () => {
  describe("loading", () => {
    it("does not call onClick while loading", () => {
      const onClick = vi.fn();
      const container = mount(() => <RLButton label="Save" loading onClick={onClick} />);
      buttonOf(container).click();
      expect(onClick).not.toHaveBeenCalled();
    });

    it("clears loading after an async click handler settles", async () => {
      const container = mount(() => (
        <RLButton label="Save" loadingAuto onClick={() => Promise.resolve()} />
      ));
      buttonOf(container).click();
      const { promise, resolve } = Promise.withResolvers<void>();
      setTimeout(resolve, 0);
      await promise;
      expect(buttonOf(container).hasAttribute("data-loading")).toBe(false);
      expect(buttonOf(container).disabled).toBe(false);
    });
  });

  describe("disabled", () => {
    it("does not call onClick when disabled", () => {
      const onClick = vi.fn();
      const container = mount(() => <RLButton label="Off" disabled onClick={onClick} />);
      buttonOf(container).click();
      expect(onClick).not.toHaveBeenCalled();
    });
  });

  describe("click handling", () => {
    it("calls a single onClick handler", () => {
      const onClick = vi.fn();
      const container = mount(() => <RLButton label="Go" onClick={onClick} />);
      buttonOf(container).click();
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it("calls every handler in an onClick array", () => {
      const first = vi.fn();
      const second = vi.fn();
      const container = mount(() => <RLButton label="Go" onClick={[first, second]} />);
      buttonOf(container).click();
      expect(first).toHaveBeenCalledTimes(1);
      expect(second).toHaveBeenCalledTimes(1);
    });
  });

  describe("non-native rendering", () => {
    it("activates a div button with Enter", () => {
      const onClick = vi.fn();
      const container = mount(() => <RLButton as="div" label="Custom" onClick={onClick} />);
      const div = container.querySelector("div[role='button']") as HTMLElement;
      div.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
      expect(onClick).toHaveBeenCalledTimes(1);
    });
  });

  describe("ref", () => {
    it("hands the rendered element to ref", () => {
      let element: HTMLElement | undefined;
      const container = mount(() => <RLButton label="Go" ref={(el) => (element = el)} />);
      expect(element).toBe(buttonOf(container));
    });
  });
});
