import { describe, it, expect } from "vite-plus/test";

import { RLCollapsible } from "../src/components/collapsible/RLCollapsible";
import { renderToString } from "@solidjs/web";
import { cleanHtml } from "./utils/normalize";

function render(fn: () => any): string {
  return cleanHtml(renderToString(fn));
}

function slotTag(html: string, slot: string): string {
  const match = html.match(new RegExp(`<[a-z0-9]+[^>]*data-slot="${slot}"[^>]*>`));
  return match?.[0] ?? "";
}

// Returns the whole element (open tag, content, close tag) so content assertions see nested markup.
function slotElement(html: string, slot: string): string {
  const start = html.search(new RegExp(`<[a-z0-9]+[^>]*data-slot="${slot}"`));
  if (start < 0) return "";
  const name = html.slice(start).match(/^<([a-z0-9]+)/)?.[1] ?? "";
  const tokens = new RegExp(`</?${name}(?=[\\s>])[^>]*>`, "g");
  tokens.lastIndex = start;
  let depth = 0;
  for (let m = tokens.exec(html); m !== null; m = tokens.exec(html)) {
    depth += m[0].startsWith("</") ? -1 : 1;
    if (depth === 0) return html.slice(start, m.index + m[0].length);
  }
  return "";
}

function attr(tag: string, name: string): string | undefined {
  const match = tag.match(new RegExp(`\\s${name}(?:="([^"]*)")?(?=[\\s>])`));
  return match ? (match[1] ?? "") : undefined;
}

describe("RLCollapsible", () => {
  describe("Open state", () => {
    it("is closed by default and hides the body", () => {
      const html = render(() => <RLCollapsible>Trigger</RLCollapsible>);
      const root = slotTag(html, "root");
      const trigger = slotTag(html, "trigger");

      expect(attr(root, "data-state")).toBe("closed");
      expect(attr(trigger, "aria-expanded")).toBe("false");
      expect(slotTag(html, "body")).toBe("");
    });

    it("opens when defaultOpen is set", () => {
      const html = render(() => <RLCollapsible defaultOpen>Trigger</RLCollapsible>);

      expect(attr(slotTag(html, "root"), "data-state")).toBe("open");
      expect(attr(slotTag(html, "trigger"), "aria-expanded")).toBe("true");
      expect(slotTag(html, "body")).not.toBe("");
    });

    it("follows the controlled open prop over defaultOpen", () => {
      const html = render(() => (
        <RLCollapsible open defaultOpen={false}>
          Trigger
        </RLCollapsible>
      ));

      expect(attr(slotTag(html, "trigger"), "aria-expanded")).toBe("true");
      expect(slotTag(html, "body")).not.toBe("");
    });
  });

  describe("Unmount on hide", () => {
    it("removes the body from the DOM while closed by default", () => {
      const html = render(() => (
        <RLCollapsible bodySlot={<p>Hidden body</p>}>Trigger</RLCollapsible>
      ));

      expect(html).not.toContain("Hidden body");
    });

    it("keeps the body mounted and hidden when unmountOnHide is false", () => {
      const html = render(() => (
        <RLCollapsible unmountOnHide={false} bodySlot={<p>Kept body</p>}>
          Trigger
        </RLCollapsible>
      ));
      const body = slotTag(html, "body");

      expect(html).toContain("Kept body");
      expect(attr(body, "data-state")).toBe("closed");
      expect(body).toContain("hidden");
    });
  });

  describe("Trigger and body slots", () => {
    it("renders children as the trigger when no bodySlot is set", () => {
      const html = render(() => <RLCollapsible>Trigger text</RLCollapsible>);

      expect(slotTag(html, "trigger")).not.toBe("");
      expect(html).toContain("Trigger text");
    });

    it("renders children as the body when triggerSlot is set", () => {
      const html = render(() => (
        <RLCollapsible defaultOpen triggerSlot={<span>Custom trigger</span>}>
          Body children
        </RLCollapsible>
      ));

      expect(slotElement(html, "trigger")).toContain("Custom trigger");
      expect(slotElement(html, "body")).toContain("Body children");
    });

    it("passes the open state to a triggerSlot render function", () => {
      const html = render(() => (
        <RLCollapsible
          defaultOpen
          triggerSlot={({ open }) => <span>{open ? "is-open" : "is-closed"}</span>}
        />
      ));

      expect(slotElement(html, "trigger")).toContain("is-open");
    });

    it("passes the open state to a bodySlot render function", () => {
      const html = render(() => (
        <RLCollapsible
          defaultOpen
          bodySlot={({ open }) => <span>{open ? "body-open" : "body-closed"}</span>}
        >
          Trigger
        </RLCollapsible>
      ));

      expect(slotElement(html, "body")).toContain("body-open");
      expect(html).not.toContain("body-closed");
    });

    it("renders no body when neither bodySlot nor triggerSlot is set and content is empty", () => {
      const html = render(() => <RLCollapsible defaultOpen />);

      expect(slotTag(html, "body")).toBe("");
    });
  });

  describe("Disabled", () => {
    it("marks the root and trigger with a presence-based data-disabled attribute", () => {
      const html = render(() => <RLCollapsible disabled>Trigger</RLCollapsible>);

      expect(attr(slotTag(html, "root"), "data-disabled")).toBe("");
      expect(attr(slotTag(html, "trigger"), "data-disabled")).toBe("");
    });

    it("omits data-disabled when enabled", () => {
      const html = render(() => <RLCollapsible>Trigger</RLCollapsible>);

      expect(slotTag(html, "root")).not.toContain("data-disabled");
      expect(slotTag(html, "trigger")).not.toContain("data-disabled");
    });
  });

  describe("Accessibility", () => {
    it("links the trigger to the body with aria-controls when the body is mounted", () => {
      const html = render(() => (
        <RLCollapsible defaultOpen bodySlot={<p>Body</p>}>
          Trigger
        </RLCollapsible>
      ));
      const trigger = slotTag(html, "trigger");
      const body = slotTag(html, "body");

      expect(attr(trigger, "aria-controls")).toBeTruthy();
      expect(attr(body, "id")).toBe(attr(trigger, "aria-controls"));
    });
  });
});
