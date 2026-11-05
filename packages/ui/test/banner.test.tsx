import { describe, it, expect } from "vite-plus/test";

import { RLBanner } from "../src/components/banner/RLBanner";
import { renderToString } from "@solidjs/web";
import { cleanHtml } from "./utils/normalize";

function render(fn: () => any): string {
  return cleanHtml(renderToString(fn));
}

function hasSlot(html: string, slot: string): boolean {
  return html.includes(`data-slot="${slot}"`);
}

describe("RLBanner", () => {
  it("renders the root with the theme attribute", () => {
    const html = render(() => <RLBanner title="News" theme="dark" />);
    expect(html).toContain('data-slot="root"');
    expect(html).toContain('data-theme="dark"');
  });

  it("renders the title prop", () => {
    const html = render(() => <RLBanner title="New release" />);
    expect(hasSlot(html, "title")).toBe(true);
    expect(html).toContain("New release");
  });

  it("replaces the title with titleSlot", () => {
    const html = render(() => (
      <RLBanner title="Ignored" titleSlot={() => <span>Slot title</span>} />
    ));
    expect(html).toContain("Slot title");
    expect(html).not.toContain("Ignored");
  });

  it("renders the icon prop as an icon element", () => {
    const html = render(() => <RLBanner icon="sparkles" title="T" />);
    expect(hasSlot(html, "icon")).toBe(true);
  });

  it("replaces the icon with iconSlot", () => {
    const html = render(() => (
      <RLBanner icon="sparkles" iconSlot={() => <span>Slot icon</span>} title="T" />
    ));
    expect(html).toContain("Slot icon");
  });

  it("renders leadingSlot in the left area", () => {
    const html = render(() => <RLBanner leadingSlot={() => <span>Slot leading</span>} title="T" />);
    expect(hasSlot(html, "left")).toBe(true);
    expect(html).toContain("Slot leading");
  });

  it("replaces the center area with centerSlot", () => {
    const html = render(() => (
      <RLBanner title="Ignored" centerSlot={() => <span>Slot center</span>} />
    ));
    expect(hasSlot(html, "center")).toBe(true);
    expect(html).toContain("Slot center");
    expect(html).not.toContain("Ignored");
  });

  it("renders trailingSlot in the right area", () => {
    const html = render(() => (
      <RLBanner title="T" trailingSlot={() => <span>Slot trailing</span>} />
    ));
    expect(hasSlot(html, "right")).toBe(true);
    expect(html).toContain("Slot trailing");
  });

  it("renders the actions from the actions prop", () => {
    const html = render(() => <RLBanner title="T" actions={[{ children: "Read" }]} />);
    expect(hasSlot(html, "actions")).toBe(true);
    expect(html).toContain("Read");
  });

  it("replaces the actions with actionsSlot", () => {
    const html = render(() => <RLBanner title="T" actionsSlot={() => <span>Slot actions</span>} />);
    expect(html).toContain("Slot actions");
  });

  it("renders the close button when dismissible is set", () => {
    const html = render(() => <RLBanner title="T" dismissible />);
    expect(hasSlot(html, "close")).toBe(true);
  });

  it("omits the close button when dismissible is false", () => {
    const html = render(() => <RLBanner title="T" dismissible={false} />);
    expect(hasSlot(html, "close")).toBe(false);
  });

  it("replaces the close button with closeSlot", () => {
    const html = render(() => (
      <RLBanner title="T" dismissible closeSlot={() => <span>Slot close</span>} />
    ));
    expect(html).toContain("Slot close");
  });

  it("renders children as the title when no title is given", () => {
    const html = render(() => <RLBanner>Child text</RLBanner>);
    expect(hasSlot(html, "title")).toBe(true);
    expect(html).toContain("Child text");
  });

  it("renders the link element when href is given", () => {
    const html = render(() => <RLBanner href="/launch" title="T" />);
    expect(hasSlot(html, "link")).toBe(true);
    expect(html).toContain('href="/launch"');
  });
});
