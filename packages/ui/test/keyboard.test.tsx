import { describe, it, expect } from "vite-plus/test";
import { renderToString } from "@solidjs/web";
import { RLKeyboard } from "../src/components/keyboard/RLKeyboard";
import { cleanHtml } from "./utils/normalize";

function render(fn: () => any): string {
  return cleanHtml(renderToString(fn));
}

function countMatches(html: string, re: RegExp): number {
  return (html.match(re) ?? []).length;
}

describe("RLKeyboard", () => {
  it("renders the root and container", () => {
    const html = render(() => <RLKeyboard />);
    expect(html).toContain('data-slot="root"');
    expect(html).toContain('data-slot="container"');
  });

  it("draws fewer keys in the 60% layout than the full layout", () => {
    const full = render(() => <RLKeyboard layout="full" />);
    const sixty = render(() => <RLKeyboard layout="60" />);
    expect(countMatches(sixty, /<text/g)).toBeLessThan(countMatches(full, /<text/g));
  });

  it("marks only the highlighted keys", () => {
    const html = render(() => <RLKeyboard layout="60" highlightedKeys={["Escape"]} />);
    expect(countMatches(html, /data-highlighted=""/g)).toBe(1);
  });

  it("applies a custom highlight color to highlighted keys", () => {
    const html = render(() => (
      <RLKeyboard layout="60" highlightedKeys={["Escape"]} highlightColor="#ff0000" />
    ));
    expect(html).toContain('fill="#ff0000"');
  });

  it("shows the legend only for groups that have a label", () => {
    const withLabel = render(() => (
      <RLKeyboard groups={[{ keys: ["Escape"], label: "Pinned group" }]} />
    ));
    const withoutLabel = render(() => <RLKeyboard groups={[{ keys: ["Escape"] }]} />);
    expect(withLabel).toContain("Pinned group");
    expect(withoutLabel).not.toContain("Pinned group");
  });

  it("uses macOS key names when os is mac", () => {
    const html = render(() => <RLKeyboard layout="60" os="mac" />);
    expect(html).toContain("cmd ⌘");
  });
});
