import { describe, it, expect } from "vite-plus/test";

import { RLIcon } from "../src/components/icon/RLIcon";
import { resolveIcon } from "../src/icons";
import { setUIConfig } from "../src/runtime";
import { renderToString } from "@solidjs/web";
import { cleanHtml } from "./utils/normalize";

function render(fn: () => any): string {
  return cleanHtml(renderToString(fn));
}

function renderRaw(fn: () => any): string {
  return renderToString(fn);
}

describe("icon resolution", () => {
  it("resolves built-in names through the default lucide map", () => {
    expect(resolveIcon("check")).toBe("i-lucide-check");
  });

  it("leaves bare names outside the default map unchanged", () => {
    expect(resolveIcon("rocket")).toBe("rocket");
  });

  it("passes through full i- prefixed class names", () => {
    expect(resolveIcon("i-tabler-check")).toBe("i-tabler-check");
  });

  it("converts set:name notation to an i- class", () => {
    expect(resolveIcon("tabler:check")).toBe("i-tabler-check");
  });

  it("prefers the custom prop over the name", () => {
    expect(resolveIcon("check", "i-custom-icon")).toBe("i-custom-icon");
  });

  it("prefers a UIConfig override over the built-in default", () => {
    setUIConfig({ icons: { check: "i-tabler-check" } });
    expect(resolveIcon("check")).toBe("i-tabler-check");
    setUIConfig(null);
  });

  it("returns an empty icon for empty input and raw markup strings", () => {
    expect(resolveIcon("")).toBe("");
    expect(resolveIcon("custom", "<svg><path/></svg>")).toBe("");
  });
});

describe("RLIcon class rendering", () => {
  it("renders built-in names as lucide icon classes", () => {
    const html = render(() => <RLIcon name="check" />);
    expect(html).toContain("i-lucide-check");
    expect(html).not.toContain("<svg");
    expect(html).toContain('data-slot="root"');
    expect(html).toContain('aria-hidden="true"');
  });

  it("renders set:name notation as an icon class for that set", () => {
    const html = render(() => <RLIcon name="tabler:rocket" />);
    expect(html).toContain("i-tabler-rocket");
    expect(html).not.toContain("<svg");
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
