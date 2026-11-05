import { describe, it, expect } from "vite-plus/test";

import { RLButton } from "../src/components/button/RLButton";
import { mountComponent } from "./utils/browser-render";

const buttonOf = (container: HTMLElement) => container.querySelector("button") as HTMLButtonElement;

describe("RLButton", () => {
  describe("content", () => {
    it("renders the label as the button text", () => {
      const container = mountComponent(() => <RLButton label="Save" />);
      expect(buttonOf(container).textContent).toContain("Save");
    });

    it("renders children in place of the label", () => {
      const container = mountComponent(() => <RLButton label="Ignored">Custom</RLButton>);
      expect(buttonOf(container).textContent).toContain("Custom");
      expect(buttonOf(container).textContent).not.toContain("Ignored");
    });

    it("defaults the native type to button", () => {
      const container = mountComponent(() => <RLButton label="Go" />);
      expect(buttonOf(container).getAttribute("type")).toBe("button");
    });

    it("passes an explicit submit type through", () => {
      const container = mountComponent(() => <RLButton label="Go" type="submit" />);
      expect(buttonOf(container).getAttribute("type")).toBe("submit");
    });

    it("forwards accessible naming attributes to the element", () => {
      const container = mountComponent(() => (
        <RLButton label="x" aria-label="Close dialog" aria-describedby="hint" />
      ));
      expect(buttonOf(container).getAttribute("aria-label")).toBe("Close dialog");
      expect(buttonOf(container).getAttribute("aria-describedby")).toBe("hint");
    });
  });

  describe("icons and slots", () => {
    it("renders the leading icon when leading is set", () => {
      const container = mountComponent(() => <RLButton label="Go" leading leadingIcon="check" />);
      expect(container.querySelector("[data-slot='leading-icon']")).not.toBeNull();
    });

    it("renders the trailing icon when trailing is set", () => {
      const container = mountComponent(() => (
        <RLButton label="Go" trailing trailingIcon="arrow-right" />
      ));
      expect(container.querySelector("[data-slot='trailing-icon']")).not.toBeNull();
    });

    it("uses the icon prop on the trailing side when trailing is true", () => {
      const container = mountComponent(() => <RLButton label="Go" icon="check" trailing />);
      expect(container.querySelector("[data-slot='trailing-icon']")).not.toBeNull();
      expect(container.querySelector("[data-slot='leading-icon']")).toBeNull();
    });

    it("replaces the leading icon with the leadingSlot", () => {
      const container = mountComponent(() => (
        <RLButton label="Go" leadingIcon="check" leadingSlot={<span data-testid="custom" />} />
      ));
      expect(container.querySelector("[data-testid='custom']")).not.toBeNull();
      expect(container.querySelector("[data-slot='leading-icon']")).toBeNull();
    });

    it("replaces the trailing icon with the trailingSlot", () => {
      const container = mountComponent(() => (
        <RLButton label="Go" trailingIcon="check" trailingSlot={<span data-testid="custom" />} />
      ));
      expect(container.querySelector("[data-testid='custom']")).not.toBeNull();
      expect(container.querySelector("[data-slot='trailing-icon']")).toBeNull();
    });

    it("renders an avatar in the leading position", () => {
      const container = mountComponent(() => <RLButton label="Profile" avatar="/me.png" />);
      expect(container.querySelector("[data-slot='leading-avatar']")).not.toBeNull();
    });
  });

  describe("loading", () => {
    it("marks the button loading, busy and disabled", () => {
      const container = mountComponent(() => <RLButton label="Save" loading />);
      const btn = buttonOf(container);
      expect(btn.hasAttribute("data-loading")).toBe(true);
      expect(btn.getAttribute("aria-busy")).toBe("true");
      expect(btn.disabled).toBe(true);
    });

    it("shows the loading icon while loading", () => {
      const container = mountComponent(() => <RLButton label="Save" loading />);
      expect(container.querySelector("[data-slot='leading-icon']")).not.toBeNull();
    });

    it("marks loadingAuto with presence", () => {
      const container = mountComponent(() => <RLButton label="Save" loadingAuto />);
      expect(buttonOf(container).hasAttribute("data-loading-auto")).toBe(true);
    });
  });

  describe("disabled", () => {
    it("is natively disabled and reports aria-disabled", () => {
      const container = mountComponent(() => <RLButton label="Off" disabled />);
      expect(buttonOf(container).disabled).toBe(true);
      expect(buttonOf(container).getAttribute("aria-disabled")).toBe("true");
    });
  });

  describe("non-native rendering", () => {
    it("renders a div with role button and keyboard focus when as is div", () => {
      const container = mountComponent(() => <RLButton as="div" label="Custom" />);
      const div = container.querySelector("div[role='button']") as HTMLElement;
      expect(div).not.toBeNull();
      expect(div.getAttribute("tabindex")).toBe("0");
    });
  });
});
