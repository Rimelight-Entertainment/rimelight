import { describe, it, expect } from "vite-plus/test";

import { RLIcon } from "../src/components/icon/RLIcon";
import { DEFAULT_ICON_NAMES, resolveIcon } from "../src/icons";
import { renderToString } from "@solidjs/web";
import { cleanHtml } from "./utils/normalize";

function render(fn: () => any): string {
  return cleanHtml(renderToString(fn));
}

function renderRaw(fn: () => any): string {
  return renderToString(fn);
}

describe("icon resolution", () => {
  it("resolves bare lucide names to i-lucide classes", () => {
    expect(resolveIcon("check")).toBe("i-lucide-check");
  });

  it("passes through full i- prefixed class names", () => {
    expect(resolveIcon("i-lucide-check")).toBe("i-lucide-check");
  });

  it("passes through collection:name class names", () => {
    expect(resolveIcon("lucide:check")).toBe("lucide:check");
  });

  it("prefers the custom prop over the name", () => {
    expect(resolveIcon("check", "i-custom-icon")).toBe("i-custom-icon");
  });

  it("returns an empty icon for empty input and raw markup strings", () => {
    expect(resolveIcon("")).toBe("");
    expect(resolveIcon("custom", "<svg><path/></svg>")).toBe("");
  });

  it("ships a non-empty default icon name list", () => {
    expect(DEFAULT_ICON_NAMES.length).toBeGreaterThan(0);
    expect(DEFAULT_ICON_NAMES).toContain("check");
  });
});

describe("RLIcon class rendering", () => {
  it("renders bare names as lucide icon classes", () => {
    const html = render(() => <RLIcon name="rocket" />);
    expect(html).toContain("i-lucide-rocket");
    expect(html).not.toContain("<svg");
    expect(html).toContain('data-slot="root"');
    expect(html).toContain('aria-hidden="true"');
  });

  it("normalizes kebab-case lucide names", () => {
    const html = render(() => <RLIcon name="external-link" />);
    expect(html).toContain("i-lucide-external-link");
  });

  it("keeps class based icons class-only (no svg markup)", () => {
    const html = render(() => <RLIcon name="i-lucide-check" />);
    expect(html).toContain("i-lucide-check");
    expect(html).not.toContain("<svg");
  });

  it("renders only the wrapper for unknown icon names", () => {
    const html = render(() => <RLIcon name="definitely-not-an-icon" />);
    expect(html).toContain('data-slot="root"');
    expect(html).not.toContain("<svg");
  });

  it("renders an empty wrapper for an empty name", () => {
    const html = render(() => <RLIcon name="" />);
    expect(html).toContain('data-slot="root"');
    expect(html).not.toContain("<svg");
  });

  it("forwards rest attributes and slot overrides over its own defaults", () => {
    const html = render(() => (
      <RLIcon name="check" data-slot="leading-icon" class="custom-icon" size="lg" />
    ));
    expect(html).toContain('data-slot="leading-icon"');
    expect(html).toContain("custom-icon");
  });

  it("renders identically on repeated renders (deterministic SSR output)", () => {
    const first = renderRaw(() => <RLIcon name="search" />);
    const second = renderRaw(() => <RLIcon name="search" />);
    expect(first).toBe(second);
  });
});
