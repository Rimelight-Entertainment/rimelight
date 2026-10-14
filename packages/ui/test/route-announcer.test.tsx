import { describe, it, expect } from "vite-plus/test";
import { RLRouteAnnouncer } from "../src/components/route-announcer/RLRouteAnnouncer";
import { renderSolid } from "./utils/normalize";

describe("RLRouteAnnouncer Component Suite", () => {
  it("renders a live region with polite ARIA attributes and sr-only styling", () => {
    const html = renderSolid(RLRouteAnnouncer, {});

    expect(html).toContain('aria-live="polite"');
    expect(html).toContain('aria-atomic="true"');
    expect(html).toContain('role="status"');
    expect(html).toContain("sr-only");
  });

  it("supports custom class and ui overrides", () => {
    const html = renderSolid(RLRouteAnnouncer, {
      class: "custom-announcer",
      ui: { root: "opacity-0" },
    });

    expect(html).toContain("custom-announcer");
    expect(html).toContain("opacity-0");
  });
});
