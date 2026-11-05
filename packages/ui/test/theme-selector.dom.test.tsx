import { afterEach, describe, expect, it, vi } from "vite-plus/test";
import { flush } from "solid-js";
import { render } from "@solidjs/web";
import { RLThemeSelector } from "../src/components/theme-selector/RLThemeSelector";
import { serializeThemePreference } from "../src/theme";

const disposers: Array<() => void> = [];

function mount(fn: () => any): HTMLElement {
  const container = document.createElement("div");
  document.body.appendChild(container);
  disposers.push(render(fn, container));
  flush();
  return container;
}

const root = (container: HTMLElement) => container.querySelector<HTMLElement>('[data-slot="root"]');

const choose = (container: HTMLElement, value: string) => {
  const select = container.querySelector<HTMLSelectElement>("select");
  if (!select) throw new Error("theme selector has no native select");
  select.value = value;
  select.dispatchEvent(new Event("change", { bubbles: true }));
  flush();
};

afterEach(() => {
  while (disposers.length) disposers.pop()?.();
  document.body.innerHTML = "";
  document.cookie = serializeThemePreference("system");
  document.documentElement.removeAttribute("data-theme");
});

describe("RLThemeSelector interactions", () => {
  it("applies a chosen theme, reports it through onValueChange, and persists it", () => {
    const onValueChange = vi.fn();
    const container = mount(() => <RLThemeSelector onValueChange={onValueChange} />);

    choose(container, "dark");

    expect(onValueChange).toHaveBeenCalledWith("dark");
    expect(root(container)?.getAttribute("data-state")).toBe("dark");
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    expect(document.cookie).toContain("dark");
  });

  it("clears the document theme attribute when the system preference is chosen", () => {
    const container = mount(() => <RLThemeSelector />);

    choose(container, "light");
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");

    choose(container, "system");
    expect(document.documentElement.hasAttribute("data-theme")).toBe(false);
    expect(root(container)?.getAttribute("data-state")).toBe("system");
  });
});
