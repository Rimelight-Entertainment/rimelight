import { describe, it, expect } from "vite-plus/test";

import { RLDropdownMenu } from "../src/components/dropdown-menu/RLDropdownMenu";
import { renderToString } from "@solidjs/web";
import { cleanHtml } from "./utils/normalize";

function render(fn: () => any): string {
  return cleanHtml(renderToString(fn));
}

function slotTag(html: string, slot: string): string {
  const match = html.match(new RegExp(`<[a-z0-9]+[^>]*data-slot="${slot}"[^>]*>`));
  return match?.[0] ?? "";
}

function attr(tag: string, name: string): string | undefined {
  return tag.match(new RegExp(`\\s${name}="([^"]*)"`))?.[1];
}

function triggerContent(html: string): string {
  return html.match(/<button[^>]*data-slot="trigger"[^>]*>([\s\S]*?)<\/button>/)?.[1] ?? "";
}

describe("RLDropdownMenu", () => {
  describe("Trigger", () => {
    it("renders a closed menu trigger that announces a menu popup", () => {
      const html = render(() => <RLDropdownMenu label="Actions" />);
      const trigger = slotTag(html, "trigger");

      expect(attr(trigger, "aria-haspopup")).toBe("menu");
      expect(attr(trigger, "aria-expanded")).toBe("false");
    });

    it("does not render the menu body while closed", () => {
      const html = render(() => <RLDropdownMenu label="Actions" items={[{ label: "Edit" }]} />);

      expect(slotTag(html, "body")).toBe("");
      expect(html).not.toContain("Edit");
    });

    it("renders the label as trigger content", () => {
      const html = render(() => <RLDropdownMenu label="Export" />);

      expect(slotTag(html, "trigger")).not.toBe("");
      expect(html).toContain("Export");
    });

    it("is icon-only when neither label nor trigger content is set", () => {
      const html = render(() => <RLDropdownMenu />);

      expect(slotTag(html, "trigger")).toMatch(/\sdata-icon-only(=""|\s|>)/);
    });

    it("is not icon-only when a label is set", () => {
      const html = render(() => <RLDropdownMenu label="Export" />);

      expect(slotTag(html, "trigger")).not.toContain("data-icon-only");
    });

    it("uses children as trigger content when triggerSlot is not set", () => {
      const html = render(() => <RLDropdownMenu>Child trigger</RLDropdownMenu>);

      expect(triggerContent(html)).toContain("Child trigger");
      expect(slotTag(html, "trigger")).not.toContain("data-icon-only");
    });

    it("prefers triggerSlot over children", () => {
      const html = render(() => (
        <RLDropdownMenu triggerSlot={<span>Slot trigger</span>}>Child trigger</RLDropdownMenu>
      ));

      expect(triggerContent(html)).toContain("Slot trigger");
      expect(triggerContent(html)).not.toContain("Child trigger");
    });

    it("renders a triggerSlot render function", () => {
      const html = render(() => <RLDropdownMenu triggerSlot={() => <span>Fn trigger</span>} />);

      expect(triggerContent(html)).toContain("Fn trigger");
    });

    it("disables the trigger button when disabled", () => {
      const html = render(() => <RLDropdownMenu label="Actions" disabled />);

      expect(slotTag(html, "trigger")).toContain("disabled");
    });

    it("forwards aria labels to the trigger, not the root", () => {
      const html = render(() => (
        <RLDropdownMenu label="Actions" aria-label="Row actions" aria-describedby="row-help" />
      ));
      const trigger = slotTag(html, "trigger");
      const root = slotTag(html, "root");

      expect(attr(trigger, "aria-label")).toBe("Row actions");
      expect(attr(trigger, "aria-describedby")).toBe("row-help");
      expect(root).not.toContain("aria-label");
    });
  });
});
