import { describe, expect, it } from "vite-plus/test";
import { RLToast } from "../src/components/toast/RLToast";
import { mountComponent } from "./utils/browser-render";

const root = (container: HTMLElement) => container.querySelector<HTMLElement>('[data-slot="root"]');

const closeButton = (container: HTMLElement) =>
  container.querySelector<HTMLButtonElement>("button");

describe("RLToast", () => {
  it("renders the title and description in their slots", () => {
    const container = mountComponent(() => (
      <RLToast title="Saved" description="Your changes are stored." duration={0} />
    ));

    expect(container.querySelector('[data-slot="title"]')?.textContent).toBe("Saved");
    expect(container.querySelector('[data-slot="description"]')?.textContent).toBe(
      "Your changes are stored.",
    );
  });

  it("omits the title and description slots when neither is provided", () => {
    const container = mountComponent(() => <RLToast duration={0} />);

    expect(container.querySelector('[data-slot="title"]')).toBeNull();
    expect(container.querySelector('[data-slot="description"]')).toBeNull();
  });

  it("announces errors as assertive alerts and other colors as polite status", () => {
    const error = mountComponent(() => <RLToast color="error" title="Failed" duration={0} />);
    const info = mountComponent(() => <RLToast color="info" title="Note" duration={0} />);

    expect(root(error)?.getAttribute("role")).toBe("alert");
    expect(root(error)?.getAttribute("aria-live")).toBe("assertive");
    expect(root(info)?.getAttribute("role")).toBe("status");
    expect(root(info)?.getAttribute("aria-live")).toBe("polite");
  });

  it("replaces the title with titleSlot and renders the slot once", () => {
    const container = mountComponent(() => (
      <RLToast
        title="Ignored"
        duration={0}
        titleSlot={() => <strong data-testid="custom-title">Custom</strong>}
      />
    ));

    expect(container.querySelectorAll('[data-testid="custom-title"]')).toHaveLength(1);
    expect(container.querySelector('[data-slot="title"]')?.textContent).toBe("Custom");
  });

  it("renders actionsSlot inside the actions region", () => {
    const container = mountComponent(() => (
      <RLToast
        title="Deleted"
        duration={0}
        actionsSlot={() => <button data-testid="undo">Undo</button>}
      />
    ));

    expect(container.querySelector('[data-slot="actions"] [data-testid="undo"]')).not.toBeNull();
  });

  it("renders children once in the body", () => {
    const container = mountComponent(() => (
      <RLToast duration={0}>
        <span data-testid="body-child">Extra</span>
      </RLToast>
    ));

    expect(container.querySelectorAll('[data-testid="body-child"]')).toHaveLength(1);
    expect(container.querySelector('[data-slot="body"] [data-testid="body-child"]')).not.toBeNull();
  });

  it("shows a close button and the dismissible marker by default", () => {
    const container = mountComponent(() => <RLToast title="Hi" duration={0} />);

    expect(root(container)?.hasAttribute("data-dismissible")).toBe(true);
    expect(closeButton(container)?.getAttribute("aria-label")).toBeTruthy();
  });

  it("removes the close button when dismissible is false", () => {
    const container = mountComponent(() => (
      <RLToast title="Consent" duration={0} dismissible={false} />
    ));

    expect(root(container)?.hasAttribute("data-dismissible")).toBe(false);
    expect(closeButton(container)).toBeNull();
  });

  it("merges class onto the root", () => {
    const container = mountComponent(() => (
      <RLToast title="Hi" duration={0} class="custom-toast" />
    ));

    expect(root(container)?.classList.contains("custom-toast")).toBe(true);
  });
});
