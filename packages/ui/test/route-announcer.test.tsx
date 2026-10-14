import { describe, it, expect } from "vite-plus/test";
import { RLRouteAnnouncer } from "../src/components/route-announcer/RLRouteAnnouncer";
import { RLRouteAnnouncerTheme } from "../src/components/route-announcer/route-announcer.theme";
import { renderSolid } from "./utils/normalize";

describe("RLRouteAnnouncer Component Suite (Unified)", () => {
  it("renders an accessible live region with polite ARIA attributes and sr-only styling", () => {
    const html = renderSolid(RLRouteAnnouncer, {});

    expect(html).toContain('aria-live="polite"');
    expect(html).toContain('aria-atomic="true"');
    expect(html).toContain('role="status"');
    expect(html).toContain("sr-only");
  });

  it("theme generates expected semantic height classes for progress bar", () => {
    const xsSlots = RLRouteAnnouncerTheme({ size: "xs" });
    expect(xsSlots.progressBar).toContain("h-0.5");
    expect(xsSlots.progressBar).toContain("fixed top-0");

    const smSlots = RLRouteAnnouncerTheme({ size: "sm" });
    expect(smSlots.progressBar).toContain("h-1");

    const mdSlots = RLRouteAnnouncerTheme({ size: "md" });
    expect(mdSlots.progressBar).toContain("h-1.5");

    const lgSlots = RLRouteAnnouncerTheme({ size: "lg" });
    expect(lgSlots.progressBar).toContain("h-2");
  });

  it("theme generates expected color classes with color: auto", () => {
    const primarySlots = RLRouteAnnouncerTheme({ color: "primary" });
    expect(primarySlots.root).toContain("rl-color-primary");
    expect(primarySlots.progressIndicator).toContain("bg-[var(--rl-bg)]");

    const secondarySlots = RLRouteAnnouncerTheme({ color: "secondary" });
    expect(secondarySlots.root).toContain("rl-color-secondary");

    const commentarySlots = RLRouteAnnouncerTheme({ color: "commentary" });
    expect(commentarySlots.root).toContain("rl-color-commentary");
  });

  it("mounts safely in non-routing environment without visual progress DOM artifact", () => {
    expect(() => RLRouteAnnouncer({})).not.toThrow();
  });
});
