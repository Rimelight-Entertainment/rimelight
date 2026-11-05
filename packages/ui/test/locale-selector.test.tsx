import { describe, it, expect } from "vite-plus/test";
import { mountComponent } from "./utils/browser-render";
import { RLLocaleSelector } from "../src/components/locale-selector/RLLocaleSelector";

describe("RLLocaleSelector", () => {
  it("renders a root carrying the slot and mode hooks", () => {
    const container = mountComponent(() => <RLLocaleSelector />);
    const root = container.querySelector('[data-slot="root"]');
    expect(root?.getAttribute("data-mode")).toBe("select");
  });

  it("sets data-theme from the theme prop", () => {
    const container = mountComponent(() => <RLLocaleSelector theme="dark" />);
    const root = container.querySelector('[data-slot="root"]');
    expect(root?.getAttribute("data-theme")).toBe("dark");
  });

  it("lists every configured locale as an option", () => {
    const container = mountComponent(() => <RLLocaleSelector />);
    const values = Array.from(container.querySelectorAll('[data-slot="option"]')).map((option) =>
      option.getAttribute("value"),
    );
    expect(values).toEqual(["en", "pt"]);
  });

  it("lists only the given locales when they are supplied as objects", () => {
    const container = mountComponent(() => (
      <RLLocaleSelector locales={[{ code: "pt", label: "Português" }]} />
    ));
    const options = Array.from(container.querySelectorAll('[data-slot="option"]'));
    expect(options.map((option) => option.getAttribute("value"))).toEqual(["pt"]);
    expect(container.innerHTML).toContain("Português");
  });

  it("pre-selects currentLocale over the active locale", () => {
    const container = mountComponent(() => <RLLocaleSelector currentLocale="pt" />);
    const selected = container.querySelector('[data-slot="option"][selected]');
    expect(selected?.getAttribute("value")).toBe("pt");
  });

  it("switches to icon mode and shows the default globe icon", () => {
    const container = mountComponent(() => <RLLocaleSelector mode="icon" />);
    expect(container.querySelector('[data-slot="root"]')?.getAttribute("data-mode")).toBe("icon");
    expect(container.innerHTML).toContain("i-lucide-globe");
  });

  it("renders a static leadingSlot", () => {
    const container = mountComponent(() => (
      <RLLocaleSelector leadingSlot={<span data-test="lead">Lead</span>} />
    ));
    expect(container.querySelector('[data-test="lead"]')).not.toBeNull();
  });

  it("invokes a render-function leadingSlot", () => {
    const container = mountComponent(() => (
      <RLLocaleSelector leadingSlot={() => <span data-test="lead-fn">Lead</span>} />
    ));
    expect(container.querySelector('[data-test="lead-fn"]')).not.toBeNull();
  });

  it("renders children after the select", () => {
    const container = mountComponent(() => (
      <RLLocaleSelector>
        <span data-test="child">Child</span>
      </RLLocaleSelector>
    ));
    expect(container.querySelector('[data-test="child"]')).not.toBeNull();
  });
});
