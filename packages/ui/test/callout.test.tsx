import { describe, it, expect } from "vite-plus/test";

import { RLCallout } from "../src/components/callout/RLCallout";
import { renderToString } from "@solidjs/web";
import { cleanHtml } from "./utils/normalize";

function render(fn: () => any): string {
  return cleanHtml(renderToString(fn));
}

function hasSlot(html: string, slot: string): boolean {
  return html.includes(`data-slot="${slot}"`);
}

describe("RLCallout", () => {
  it("renders the root with the alert role and the theme attribute", () => {
    const html = render(() => <RLCallout theme="dark">Body text</RLCallout>);
    expect(html).toContain('data-slot="root"');
    expect(html).toContain('data-theme="dark"');
    expect(html).toContain('role="alert"');
  });

  it("renders the title and description props", () => {
    const html = render(() => <RLCallout title="Heads up" description="Something happened" />);
    expect(hasSlot(html, "title")).toBe(true);
    expect(html).toContain("Heads up");
    expect(hasSlot(html, "description")).toBe(true);
    expect(html).toContain("Something happened");
  });

  it("renders children as the description when no description is given", () => {
    const html = render(() => <RLCallout>Child body</RLCallout>);
    expect(hasSlot(html, "description")).toBe(true);
    expect(html).toContain("Child body");
  });

  it("omits the title element when neither title nor titleSlot is provided", () => {
    const html = render(() => <RLCallout description="Only text" />);
    expect(hasSlot(html, "title")).toBe(false);
  });

  it("replaces the title with titleSlot", () => {
    const html = render(() => (
      <RLCallout title="Ignored" titleSlot={() => <span>Slot title</span>} />
    ));
    expect(html).toContain("Slot title");
    expect(html).not.toContain("Ignored");
  });

  it("replaces the description with descriptionSlot", () => {
    const html = render(() => (
      <RLCallout description="Ignored" descriptionSlot={() => <span>Slot description</span>} />
    ));
    expect(html).toContain("Slot description");
    expect(html).not.toContain("Ignored");
  });

  it("renders headerSlot between title and description", () => {
    const html = render(() => (
      <RLCallout title="T" description="D" headerSlot={() => <span>Slot header</span>} />
    ));
    expect(hasSlot(html, "header")).toBe(true);
    expect(html).toContain("Slot header");
    expect(html.indexOf("Slot header")).toBeGreaterThan(html.indexOf("T"));
    expect(html.indexOf("Slot header")).toBeLessThan(html.indexOf("D"));
  });

  it("renders iconSlot in the leading area", () => {
    const html = render(() => <RLCallout iconSlot={() => <span>Slot icon</span>} />);
    expect(html).toContain("Slot icon");
    expect(hasSlot(html, "icon")).toBe(true);
  });

  it("renders the icon prop as an icon element", () => {
    const html = render(() => <RLCallout icon="info" />);
    expect(hasSlot(html, "icon")).toBe(true);
  });

  it("renders avatarSlot instead of the avatar prop", () => {
    const html = render(() => (
      <RLCallout avatar="https://example.com/a.png" avatarSlot={() => <span>Slot avatar</span>} />
    ));
    expect(html).toContain("Slot avatar");
    expect(hasSlot(html, "avatar")).toBe(false);
  });

  it("renders the avatar when an avatar source is given", () => {
    const html = render(() => <RLCallout avatar="https://example.com/a.png" />);
    expect(hasSlot(html, "avatar")).toBe(true);
  });

  it("renders the actions from the actions prop", () => {
    const html = render(() => <RLCallout actions={[{ children: "Retry" }]} />);
    expect(hasSlot(html, "actions")).toBe(true);
    expect(html).toContain("Retry");
  });

  it("replaces the actions with actionsSlot", () => {
    const html = render(() => <RLCallout actionsSlot={() => <span>Slot actions</span>} />);
    expect(html).toContain("Slot actions");
  });

  it("renders the close button by default", () => {
    const html = render(() => <RLCallout>Body</RLCallout>);
    expect(hasSlot(html, "close")).toBe(true);
  });

  it("omits the close button when dismissible is false", () => {
    const html = render(() => <RLCallout dismissible={false}>Body</RLCallout>);
    expect(hasSlot(html, "close")).toBe(false);
  });

  it("replaces the close button with closeSlot even when dismissible is false", () => {
    const html = render(() => (
      <RLCallout dismissible={false} closeSlot={() => <span>Slot close</span>}>
        Body
      </RLCallout>
    ));
    expect(html).toContain("Slot close");
  });

  it("renders nothing when open is false", () => {
    const html = render(() => <RLCallout open={false}>Body</RLCallout>);
    expect(hasSlot(html, "root")).toBe(false);
  });

  it("labels the root with the title id when a title is rendered", () => {
    const html = render(() => <RLCallout title="Heads up">Body</RLCallout>);
    expect(html).toMatch(/aria-labelledby="[^"]+"/);
  });

  it("uses aria-label when no title is rendered", () => {
    const html = render(() => <RLCallout aria-label="Notice">Body</RLCallout>);
    expect(html).toContain('aria-label="Notice"');
  });
});
