import { describe, it, expect } from "vite-plus/test";
import { RLMarquee } from "../src/components/marquee/RLMarquee";
import { renderSolid } from "./utils/normalize";

describe("RLMarquee Solid Component Suite", () => {
  it("renders 2 tracks for seamless infinite looping", () => {
    const html = renderSolid(RLMarquee, {
      children: () => <span>Item</span>,
    });

    expect(html).toContain('data-slot="root"');
    const matches = html.match(/data-slot="track"/g);
    expect(matches?.length).toBe(2);
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain("calc(-100% - var(--marquee-gap, 1rem))");
  });

  it("applies custom gap and speed", () => {
    const html = renderSolid(RLMarquee, {
      gap: "2rem",
      speed: 25,
      children: () => <span>Item</span>,
    });

    expect(html).toContain("--marquee-gap:2rem");
    expect(html).toContain("animation-duration:25s");
  });
});
