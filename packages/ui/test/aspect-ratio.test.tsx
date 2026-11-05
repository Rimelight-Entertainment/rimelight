import { describe, it, expect } from "vite-plus/test";

import { RLAspectRatio } from "../src/components/aspect-ratio/RLAspectRatio";
import { renderSolid } from "./utils/normalize";

describe("RLAspectRatio", () => {
  it("defaults to a 1:1 box when ratio is omitted", () => {
    const html = renderSolid(RLAspectRatio, {}, "child");
    expect(html).toContain('data-ratio="1"');
    expect(html).toContain('viewBox="0 0 100 100"');
  });

  it("derives the spacer viewBox height from the ratio", () => {
    const html = renderSolid(RLAspectRatio, { ratio: 16 / 9 }, "child");
    expect(html).toContain('data-ratio="1.7777777777777777"');
    expect(html).toContain('viewBox="0 0 100 56.25"');
  });

  it.each([0, -2, Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])(
    "falls back to 1:1 for invalid ratio %s",
    (ratio) => {
      const html = renderSolid(RLAspectRatio, { ratio }, "child");
      expect(html).toContain('data-ratio="1"');
      expect(html).toContain('viewBox="0 0 100 100"');
    },
  );

  it("places children inside the content slot, not the spacer", () => {
    const html = renderSolid(RLAspectRatio, { ratio: 1 }, () => <span>media</span>);
    expect(html).toMatch(/data-slot="content"[^>]*>\s*<span>media<\/span>/);
  });

  it("hides the spacer from assistive technology", () => {
    const html = renderSolid(RLAspectRatio, {}, "child");
    expect(html).toMatch(
      /data-slot="spacer"[^>]*aria-hidden="true"|aria-hidden="true"[^>]*data-slot="spacer"/,
    );
  });

  it("renders the requested element through as", () => {
    const html = renderSolid(RLAspectRatio, { as: "section" }, "child");
    expect(html.startsWith("<section")).toBe(true);
  });

  it("forwards extra attributes to the root element", () => {
    const html = renderSolid(RLAspectRatio, { id: "hero", "data-test": "x" }, "child");
    expect(html).toContain('id="hero"');
    expect(html).toContain('data-test="x"');
  });
});
