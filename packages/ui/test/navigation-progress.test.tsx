import { describe, it, expect } from "vite-plus/test";
import { RLNavigationProgress } from "../src/components/navigation-progress/RLNavigationProgress";
import { RLNavigationProgressTheme } from "../src/components/navigation-progress/navigation-progress.theme";

describe("RLNavigationProgress Component Suite", () => {
  it("theme generates expected semantic classes for different sizes", () => {
    const xsSlots = RLNavigationProgressTheme({ size: "xs" });
    expect(xsSlots.root).toContain("h-0.5");
    expect(xsSlots.root).toContain("fixed top-0");

    const smSlots = RLNavigationProgressTheme({ size: "sm" });
    expect(smSlots.root).toContain("h-1");

    const mdSlots = RLNavigationProgressTheme({ size: "md" });
    expect(mdSlots.root).toContain("h-1.5");

    const lgSlots = RLNavigationProgressTheme({ size: "lg" });
    expect(lgSlots.root).toContain("h-2");
  });

  it("theme generates expected color classes with color: auto", () => {
    const primarySlots = RLNavigationProgressTheme({ color: "primary" });
    expect(primarySlots.root).toContain("rl-color-primary");

    const secondarySlots = RLNavigationProgressTheme({ color: "secondary" });
    expect(secondarySlots.root).toContain("rl-color-secondary");

    const commentarySlots = RLNavigationProgressTheme({ color: "commentary" });
    expect(commentarySlots.root).toContain("rl-color-commentary");
  });

  it("does not render DOM node when not routing in idle router environment", () => {
    // In standalone test environment without router navigation, Show returns empty string / comment
    // Component should mount safely without throwing errors
    expect(() => RLNavigationProgress({})).not.toThrow();
  });
});
