import { describe, it, expect } from "vite-plus/test";
import { userEvent } from "vite-plus/test/browser";
import { createSignal } from "solid-js";
import { mountComponent } from "./utils/browser-render";
import { RLButton } from "../src/components/button/RLButton";

describe("RLButton — browser", () => {
  describe("click interactions", () => {
    it("fires onClick when clicked", async () => {
      let clicked = false;
      const screen = mountComponent(() => (
        <RLButton
          label="Click me"
          onClick={() => {
            clicked = true;
          }}
        />
      ));

      await screen.getByRole("button", { name: "Click me" }).click();
      expect(clicked).toBe(true);
    });

    it("does not fire onClick when disabled", async () => {
      let clicked = false;
      const screen = mountComponent(() => (
        <RLButton
          label="Disabled"
          disabled
          onClick={() => {
            clicked = true;
          }}
        />
      ));

      await screen.getByRole("button").click({ force: true });
      expect(clicked).toBe(false);
    });

    it("increments a reactive counter on click", async () => {
      const [count, setCount] = createSignal(0);
      const screen = mountComponent(() => (
        <div>
          <span data-testid="count">{count()}</span>
          <RLButton label="Increment" onClick={() => setCount((n) => n + 1)} />
        </div>
      ));

      await expect.element(screen.getByTestId("count")).toHaveTextContent("0");
      await screen.getByRole("button", { name: "Increment" }).click();
      await expect.element(screen.getByTestId("count")).toHaveTextContent("1");
      await screen.getByRole("button", { name: "Increment" }).click();
      await expect.element(screen.getByTestId("count")).toHaveTextContent("2");
    });
  });

  describe("DOM presence and accessibility", () => {
    it("renders a native <button> element", async () => {
      const screen = mountComponent(() => <RLButton label="Native" />);
      const btn = screen.getByRole("button", { name: "Native" });
      await expect.element(btn).toBeInTheDocument();
      expect(btn.element().tagName).toBe("BUTTON");
    });

    it("is disabled and has aria-disabled when disabled prop is set", async () => {
      const screen = mountComponent(() => <RLButton label="Off" disabled />);
      const btn = screen.getByRole("button", { name: "Off" });
      await expect.element(btn).toBeDisabled();
      await expect.element(btn).toHaveAttribute("aria-disabled", "true");
    });

    it("renders as an <a> for external href", async () => {
      const screen = mountComponent(() => <RLButton href="https://example.com" label="Open" />);
      // External links render as <a> with target _blank
      const link = screen.getByRole("link", { name: /Open/i });
      await expect.element(link).toBeInTheDocument();
      await expect.element(link).toHaveAttribute("target", "_blank");
    });

    it("includes screen-reader hint for external links", async () => {
      const screen = mountComponent(() => <RLButton href="https://example.com" label="Open" />);
      await expect.element(screen.getByText("(opens in a new tab)")).toBeInTheDocument();
    });

    it("renders div with role=button when as=div", async () => {
      const screen = mountComponent(() => <RLButton as="div" label="Custom" />);
      const btn = screen.getByRole("button", { name: "Custom" });
      await expect.element(btn).toBeInTheDocument();
      expect(btn.element().tagName).toBe("DIV");
    });
  });

  describe("keyboard interaction", () => {
    it("is focusable and activatable via keyboard", async () => {
      let clicked = false;
      const screen = mountComponent(() => (
        <RLButton
          label="Press me"
          onClick={() => {
            clicked = true;
          }}
        />
      ));

      const btn = screen.getByRole("button", { name: "Press me" });
      btn.element().focus();
      await userEvent.keyboard("{Enter}");
      expect(clicked).toBe(true);
    });

    it("disabled button is not focusable via tab", async () => {
      const screen = mountComponent(() => (
        <div>
          <RLButton label="First" />
          <RLButton label="Disabled" disabled />
          <RLButton label="Third" />
        </div>
      ));

      screen.getByRole("button", { name: "First" }).element().focus();
      await userEvent.keyboard("{Tab}");
      // Should skip disabled button and focus third
      await expect.element(screen.getByRole("button", { name: "Third" })).toHaveFocus();
    });
  });
});
