import { afterEach, describe, expect, it } from "vite-plus/test";
import { RLThemeSelector } from "../src/components/theme-selector/RLThemeSelector";
import { serializeThemePreference } from "../src/theme";
import { mountComponent } from "./utils/browser-render";

const root = (container: HTMLElement) => container.querySelector<HTMLElement>('[data-slot="root"]');

const nativeSelect = (container: HTMLElement) =>
  container.querySelector<HTMLSelectElement>("select");

describe("RLThemeSelector", () => {
  afterEach(() => {
    document.cookie = serializeThemePreference("system");
    document.documentElement.removeAttribute("data-theme");
  });

  it("renders the root with the theme and select mode by default", () => {
    const container = mountComponent(() => <RLThemeSelector />);

    expect(root(container)?.getAttribute("data-mode")).toBe("select");
    expect(root(container)?.hasAttribute("data-theme")).toBe(false);
    expect(container.querySelector('[data-slot="wrapper"]')).not.toBeNull();
  });

  it("reflects the requested mode on the root", () => {
    const container = mountComponent(() => <RLThemeSelector mode="icon" />);

    expect(root(container)?.getAttribute("data-mode")).toBe("icon");
  });

  it("labels the native select for assistive technology", () => {
    const container = mountComponent(() => <RLThemeSelector />);

    expect(nativeSelect(container)?.getAttribute("aria-label")).toBeTruthy();
  });

  it("starts on the system preference when no cookie is set", () => {
    const container = mountComponent(() => <RLThemeSelector />);

    expect(root(container)?.getAttribute("data-state")).toBe("system");
    expect(nativeSelect(container)?.value).toBe("system");
  });

  it("renders children once inside the root", () => {
    const container = mountComponent(() => (
      <RLThemeSelector>
        <span data-testid="extra">Extra</span>
      </RLThemeSelector>
    ));

    expect(container.querySelectorAll('[data-testid="extra"]')).toHaveLength(1);
    expect(root(container)?.contains(container.querySelector('[data-testid="extra"]'))).toBe(true);
  });

  it("merges class onto the root", () => {
    const container = mountComponent(() => <RLThemeSelector class="custom-selector" />);

    expect(root(container)?.classList.contains("custom-selector")).toBe(true);
  });
});
