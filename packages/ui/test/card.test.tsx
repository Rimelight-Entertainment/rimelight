import { describe, it, expect } from "vite-plus/test";

import { RLCard } from "../src/components/card/RLCard";
import { renderToString } from "@solidjs/web";
import { cleanHtml } from "./utils/normalize";

function render(fn: () => any): string {
  return cleanHtml(renderToString(fn));
}

function hasSlot(html: string, slot: string): boolean {
  return html.includes(`data-slot="${slot}"`);
}

describe("RLCard", () => {
  it("renders a div root by default", () => {
    const html = render(() => <RLCard>Body</RLCard>);
    expect(html).toMatch(/^<div[^>]*data-slot="root"/);
    expect(html).not.toContain("data-theme=");
  });

  it("sets data-theme from the theme prop", () => {
    const html = render(() => <RLCard theme="dark">Body</RLCard>);
    expect(html).toContain('data-theme="dark"');
  });

  it("renders an anchor root when href is given", () => {
    const html = render(() => <RLCard href="/docs">Body</RLCard>);
    expect(html).toMatch(/^<a[^>]*data-slot="root"/);
    expect(html).toContain('href="/docs"');
  });

  it("renders the title and description props in the header", () => {
    const html = render(() => <RLCard title="Plan" description="Monthly" />);
    expect(hasSlot(html, "header")).toBe(true);
    expect(html).toContain("Plan");
    expect(html).toContain("Monthly");
  });

  it("renders no header when no title, description or headerSlot is provided", () => {
    const html = render(() => <RLCard>Body</RLCard>);
    expect(hasSlot(html, "header")).toBe(false);
  });

  it("replaces the title with titleSlot", () => {
    const html = render(() => <RLCard title="Ignored" titleSlot={() => <span>Slot title</span>} />);
    expect(html).toContain("Slot title");
    expect(html).not.toContain("Ignored");
  });

  it("replaces the description with descriptionSlot", () => {
    const html = render(() => (
      <RLCard description="Ignored" descriptionSlot={() => <span>Slot description</span>} />
    ));
    expect(html).toContain("Slot description");
    expect(html).not.toContain("Ignored");
  });

  it("replaces the whole header with headerSlot", () => {
    const html = render(() => (
      <RLCard title="Ignored" headerSlot={() => <span>Slot header</span>} />
    ));
    expect(html).toContain("Slot header");
    expect(html).not.toContain("Ignored");
    expect(hasSlot(html, "title")).toBe(false);
  });

  it("renders children as the body", () => {
    const html = render(() => <RLCard>Child body</RLCard>);
    expect(hasSlot(html, "body")).toBe(true);
    expect(html).toContain("Child body");
  });

  it("replaces the body with bodySlot", () => {
    const html = render(() => <RLCard bodySlot={() => <span>Slot body</span>}>Ignored</RLCard>);
    expect(html).toContain("Slot body");
    expect(html).not.toContain("Ignored");
  });

  it("renders footerSlot in the footer", () => {
    const html = render(() => <RLCard footerSlot={() => <span>Slot footer</span>} />);
    expect(hasSlot(html, "footer")).toBe(true);
    expect(html).toContain("Slot footer");
  });

  it("renders mediaSrc as an image inside the media area", () => {
    const html = render(() => <RLCard mediaSrc="/cover.png" title="Cover" />);
    expect(hasSlot(html, "media")).toBe(true);
    expect(html).toContain('src="/cover.png"');
  });

  it("replaces the media area with mediaSlot", () => {
    const html = render(() => (
      <RLCard mediaSrc="/cover.png" mediaSlot={() => <span>Slot media</span>} />
    ));
    expect(html).toContain("Slot media");
    expect(html).not.toContain('src="/cover.png"');
  });

  it("renders overlaySlot over the header, body and footer", () => {
    const html = render(() => (
      <RLCard
        title="Hidden"
        footerSlot={() => <span>Hidden footer</span>}
        overlaySlot={() => <span>Slot overlay</span>}
      >
        Hidden body
      </RLCard>
    ));
    expect(hasSlot(html, "overlay")).toBe(true);
    expect(html).toContain("Slot overlay");
    expect(hasSlot(html, "header")).toBe(false);
    expect(hasSlot(html, "body")).toBe(false);
    expect(hasSlot(html, "footer")).toBe(false);
  });

  it("does not render the overlay without overlaySlot", () => {
    const html = render(() => <RLCard>Body</RLCard>);
    expect(hasSlot(html, "overlay")).toBe(false);
  });
});
