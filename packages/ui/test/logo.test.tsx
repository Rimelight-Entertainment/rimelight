import { describe, expect, it } from "vite-plus/test";
import { RLLogo } from "../src/components/logo/RLLogo";
import { mountComponent } from "./utils/browser-render";

describe("RLLogo", () => {
  it("renders as a link using alt as its accessible name", () => {
    const container = mountComponent(() => <RLLogo alt="Rimelight" href="/" />);
    const link = container.querySelector("a");
    expect(link).not.toBeNull();
    expect(link?.getAttribute("aria-label")).toBe("Rimelight");
  });

  it("renders children when no logo set resolves", () => {
    const container = mountComponent(() => (
      <RLLogo variant="unconfigured-logo-set" alt="Rimelight">
        <span>Fallback text</span>
      </RLLogo>
    ));
    expect(container.textContent).toContain("Fallback text");
  });

  it("uses the src override as the image source", () => {
    const container = mountComponent(() => <RLLogo src="/custom.svg" alt="Custom" />);
    const image = container.querySelector<HTMLImageElement>("img");
    expect(image?.getAttribute("src")).toBe("/custom.svg");
  });
});
