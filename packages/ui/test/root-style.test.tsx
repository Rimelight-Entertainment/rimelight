import { describe, it, expect } from "vite-plus/test";
import { RLStickySurface } from "../src/components/sticky-surface/RLStickySurface";
import { RLMarquee } from "../src/components/marquee/RLMarquee";
import { renderSolid } from "./utils/normalize";

describe("root elements own their runtime styling", () => {
  it("sticky surface sets its offset and z-index variables", () => {
    const html = renderSolid(RLStickySurface, {
      offsetTop: 12,
      zIndex: 20,
      children: () => <span>Content</span>,
    });

    expect(html).toContain("--rl-sticky-top:12px");
    expect(html).toContain("--rl-sticky-z:20");
  });

  it("marquee sets its gap and speed variables", () => {
    const html = renderSolid(RLMarquee, {
      gap: "2rem",
      speed: 20,
      children: () => <span>Item</span>,
    });

    expect(html).toContain("--marquee-gap:2rem");
    expect(html).toContain("--rl-marquee-speed:20s");
  });
});
