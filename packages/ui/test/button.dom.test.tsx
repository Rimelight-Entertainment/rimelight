import { describe, it, expect } from "vite-plus/test";
import { mountComponent } from "./utils/browser-render";
import { RLButton } from "../src/components/button/RLButton";

describe("RLButton — DOM presence & accessibility", () => {
  it("renders a native <button> element", () => {
    const container = mountComponent(() => <RLButton label="Native" />);
    const btn = container.querySelector("button");
    expect(btn).not.toBeNull();
    expect(btn?.textContent).toContain("Native");
  });

  it("is disabled and has aria-disabled when disabled prop is set", () => {
    const container = mountComponent(() => <RLButton label="Off" disabled />);
    const btn = container.querySelector("button");
    expect(btn?.disabled).toBe(true);
    expect(btn?.getAttribute("aria-disabled")).toBe("true");
  });

  it("renders as an <a> for external href", () => {
    const container = mountComponent(() => <RLButton href="https://example.com" label="Open" />);
    const link = container.querySelector("a");
    expect(link).not.toBeNull();
    expect(link?.getAttribute("target")).toBe("_blank");
  });

  it("includes screen-reader hint for external links", () => {
    const container = mountComponent(() => <RLButton href="https://example.com" label="Open" />);
    expect(container.textContent).toContain("(opens in a new tab)");
  });

  it("renders div with role=button when as=div", () => {
    const container = mountComponent(() => <RLButton as="div" label="Custom" />);
    const div = container.querySelector("div[role='button']");
    expect(div).not.toBeNull();
    expect(div?.tagName).toBe("DIV");
  });
});
