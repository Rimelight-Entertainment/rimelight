import { describe, it, expect } from "vite-plus/test";

import { RLAvatar } from "../src/components/avatar/RLAvatar";
import { renderToString } from "@solidjs/web";
import { cleanHtml } from "./utils/normalize";

function render(fn: () => any): string {
  return cleanHtml(renderToString(fn));
}

function hasSlot(html: string, slot: string): boolean {
  return html.includes(`data-slot="${slot}"`);
}

describe("RLAvatar", () => {
  it("renders the root with the theme attribute", () => {
    const html = render(() => <RLAvatar alt="Ada Lovelace" theme="dark" />);
    expect(html).toContain('data-slot="root"');
    expect(html).toContain('data-theme="dark"');
  });

  it("renders the image when src is given", () => {
    const html = render(() => <RLAvatar src="/ada.png" alt="Ada Lovelace" />);
    expect(hasSlot(html, "image")).toBe(true);
    expect(html).toContain('src="/ada.png"');
    expect(html).toContain('alt="Ada Lovelace"');
    expect(hasSlot(html, "fallback")).toBe(false);
  });

  it("derives initials from alt when no image is available", () => {
    const html = render(() => <RLAvatar alt="Benjamin Canac" />);
    expect(hasSlot(html, "fallback")).toBe(true);
    expect(html).toContain("BC");
  });

  it("uses text over alt-derived initials", () => {
    const html = render(() => <RLAvatar alt="Benjamin Canac" text="XY" />);
    expect(html).toContain("XY");
    expect(html).not.toContain("BC");
  });

  it("renders the icon prop in the fallback when there is no image", () => {
    const html = render(() => <RLAvatar icon="star" />);
    expect(hasSlot(html, "icon")).toBe(true);
  });

  it("renders iconSlot in the fallback when there is no image", () => {
    const html = render(() => <RLAvatar iconSlot={() => <span>Slot icon</span>} />);
    expect(html).toContain("Slot icon");
  });

  it("replaces the fallback with fallbackSlot", () => {
    const html = render(() => (
      <RLAvatar alt="Benjamin Canac" fallbackSlot={() => <span>Slot fallback</span>} />
    ));
    expect(html).toContain("Slot fallback");
    expect(html).not.toContain("BC");
  });

  it("renders the badge text inside a chip", () => {
    const html = render(() => <RLAvatar src="/ada.png" alt="Ada" badge="3" />);
    expect(hasSlot(html, "badge")).toBe(true);
    expect(html).toContain("3");
  });

  it("replaces the badge text with badgeSlot", () => {
    const html = render(() => (
      <RLAvatar src="/ada.png" alt="Ada" badge="3" badgeSlot={() => <span>Slot badge</span>} />
    ));
    expect(html).toContain("Slot badge");
  });

  it("renders no badge without badge or badgeSlot", () => {
    const html = render(() => <RLAvatar src="/ada.png" alt="Ada" />);
    expect(hasSlot(html, "badge")).toBe(false);
  });

  it("renders children in place of the image and fallback", () => {
    const html = render(() => (
      <RLAvatar src="/ada.png" alt="Ada">
        <span>Child content</span>
      </RLAvatar>
    ));
    expect(html).toContain("Child content");
    expect(hasSlot(html, "image")).toBe(false);
  });

  it("renders title and subtitle beside the avatar", () => {
    const html = render(() => <RLAvatar alt="Ada" title="Ada Lovelace" subtitle="Engineer" />);
    expect(hasSlot(html, "wrapper")).toBe(true);
    expect(hasSlot(html, "title")).toBe(true);
    expect(html).toContain("Ada Lovelace");
    expect(hasSlot(html, "subtitle")).toBe(true);
    expect(html).toContain("Engineer");
  });

  it("renders the image with an empty alt when only src is given", () => {
    const html = render(() => <RLAvatar src="/ada.png" />);
    expect(html).toMatch(/<img[^>]*\salt(?:=""|(?=[\s>]))/);
  });
});
