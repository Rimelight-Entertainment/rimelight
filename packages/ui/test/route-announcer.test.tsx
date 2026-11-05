import { describe, it, expect } from "vite-plus/test";
import { RLRouteAnnouncer } from "../src/components/route-announcer/RLRouteAnnouncer";
import { renderSolid } from "./utils/normalize";

describe("RLRouteAnnouncer", () => {
  it("renders a polite, atomic live region as the root's first child", () => {
    const html = renderSolid(RLRouteAnnouncer, {});

    expect(html).toContain('data-slot="root"');
    expect(html).toContain('role="status"');
    expect(html).toContain('aria-live="polite"');
    expect(html).toContain('aria-atomic="true"');
  });

  it("omits the progress bar when no router is mounted", () => {
    const html = renderSolid(RLRouteAnnouncer, {});

    expect(html).not.toContain('role="progressbar"');
  });

  it("honors the as prop for the root element", () => {
    const html = renderSolid(RLRouteAnnouncer, { as: "section" });

    expect(html.startsWith("<section")).toBe(true);
  });

  it("does not forward component-only props to the DOM", () => {
    const html = renderSolid(RLRouteAnnouncer, { prefix: "Went to", progress: false, size: "lg" });

    expect(html).not.toContain("prefix=");
    expect(html).not.toContain("progress=");
    expect(html).not.toMatch(/\ssize=/);
  });
});
