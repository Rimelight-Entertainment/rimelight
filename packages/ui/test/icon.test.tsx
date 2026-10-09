import { describe, it, expect } from "vite-plus/test";

import { RLIcon } from "../src/components/icon/RLIcon";
import { getIconNodes, getIconSvg, nodesToSvg, ICONS } from "../src/icons.raw";
import { renderToString } from "@solidjs/web";
import { cleanHtml } from "./utils/normalize";

function render(fn: () => any): string {
  return cleanHtml(renderToString(fn));
}

function renderRaw(fn: () => any): string {
  return renderToString(fn);
}

describe("structured icon system", () => {
  it("serializes structured nodes to SVG markup for preset/UnoCSS", () => {
    const nodes = getIconNodes("check");
    expect(nodes).toBeDefined();
    const svgString = getIconSvg("check");
    expect(svgString).toContain("<svg");
    expect(svgString).toContain('<path d="M20 6 9 17l-5-5"/>');
  });

  it("normalizes kebab-case icon names to camelCase keys", () => {
    const nodes = getIconNodes("external-link");
    expect(nodes).toBeDefined();
    expect(nodes).toEqual(ICONS["externalLink"]);
  });

  it("converts custom icon nodes via nodesToSvg", () => {
    const custom = nodesToSvg([["circle", { cx: "5", cy: "5", r: "5" }]]);
    expect(custom).toBe('<circle cx="5" cy="5" r="5"/>');
  });
});

describe("RLIcon structured rendering", () => {
  it("renders built-in icons as real svg nodes", () => {
    const html = render(() => <RLIcon name="rocket" />);
    expect(html).toContain("<svg");
    expect(html).toContain("<path");
    expect(html).toContain('data-slot="icon"');
    expect(html).toContain('aria-hidden="true"');
  });

  it("normalizes kebab-case icon names to the camelCase dictionary keys", () => {
    const html = render(() => <RLIcon name="external-link" />);
    expect(html).toContain("<svg");
    expect(html).toContain("<path");
  });

  it("keeps class based icons class-only (no svg markup)", () => {
    const html = render(() => <RLIcon name="i-lucide-check" />);
    expect(html).toContain("i-lucide-check");
    expect(html).not.toContain("<svg");
  });

  it("renders nothing but the wrapper for unknown icon names", () => {
    const html = render(() => <RLIcon name="definitely-not-an-icon" />);
    expect(html).toContain('data-slot="icon"');
    expect(html).not.toContain("<svg");
  });

  it("renders an empty wrapper for an empty name", () => {
    const html = render(() => <RLIcon name="" />);
    expect(html).toContain('data-slot="icon"');
    expect(html).not.toContain("<svg");
  });

  it("forwards rest attributes and slot overrides over its own defaults", () => {
    const html = render(() => (
      <RLIcon name="check" data-slot="leading-icon" class="custom-icon" size="lg" />
    ));
    expect(html).toContain('data-slot="leading-icon"');
    expect(html).toContain("custom-icon");
  });

  it("renders custom structured icon nodes passed through custom prop", () => {
    const html = render(() => (
      <RLIcon name="custom" custom={[["rect", { width: "8", height: "8" }]]} />
    ));
    expect(html).toContain("<svg");
    expect(html).toContain('<rect width="8" height="8"');
  });

  it("renders identically on repeated renders (deterministic SSR output)", () => {
    const first = renderRaw(() => <RLIcon name="search" />);
    const second = renderRaw(() => <RLIcon name="search" />);
    expect(first).toBe(second);
  });
});
