import { describe, it, expect } from "vite-plus/test";

import { RLConfirm } from "../src/components/confirm/RLConfirm";
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

describe("RLConfirm", () => {
  describe("Exports", () => {
    it("exports RLConfirm component from index", () => {
      expect(RLConfirm).toBeDefined();
    });
  });

  describe("Structure & Defaults", () => {
    it("renders trigger button when triggerLabel is provided", () => {
      const html = render(() => <RLConfirm triggerLabel="Delete Item" />);
      expect(slotTag(html, "trigger")).not.toBe("");
      expect(html).toContain("Delete Item");
    });

    it("renders confirmation dialog when open={true}", () => {
      const html = render(() => (
        <RLConfirm
          open
          portal={false}
          title="Confirm Action"
          description="Are you sure you want to proceed?"
        >
          Additional confirmation details.
        </RLConfirm>
      ));

      expect(slotTag(html, "content")).not.toBe("");
      expect(slotTag(html, "title")).not.toBe("");
      expect(slotTag(html, "description")).not.toBe("");
      expect(html).toContain("Confirm Action");
      expect(html).toContain("Are you sure you want to proceed?");
      expect(html).toContain("Additional confirmation details.");
      expect(html).toContain("Cancel");
      expect(html).toContain("Confirm");
    });

    it("supports custom actionLabel and cancelLabel", () => {
      const html = render(() => (
        <RLConfirm
          open
          portal={false}
          title="Discard Draft"
          actionLabel="Discard"
          cancelLabel="Keep Editing"
        />
      ));

      expect(html).toContain("Discard");
      expect(html).toContain("Keep Editing");
    });

    it("supports custom titleSlot and descriptionSlot", () => {
      const html = render(() => (
        <RLConfirm
          open
          portal={false}
          titleSlot={() => <h3 class="custom-confirm-title">Slot Title</h3>}
          descriptionSlot={() => <p class="custom-confirm-desc">Slot Description</p>}
        />
      ));

      expect(html).toContain("custom-confirm-title");
      expect(html).toContain("Slot Title");
      expect(html).toContain("custom-confirm-desc");
      expect(html).toContain("Slot Description");
    });

    it("supports custom footer override", () => {
      const html = render(() => (
        <RLConfirm
          open
          portal={false}
          title="Custom Footer"
          footerSlot={() => (
            <button type="button" class="custom-footer-btn">
              Understood
            </button>
          )}
        />
      ));

      expect(html).toContain("custom-footer-btn");
      expect(html).toContain("Understood");
      expect(html).not.toContain("Cancel");
    });
  });

  describe("Variants", () => {
    it("renders default variant with primary action button", () => {
      const html = render(() => (
        <RLConfirm open portal={false} variant="default" title="Save Changes" />
      ));
      expect(slotTag(html, "action")).toContain("rl-color-primary");
    });

    it("renders destructive variant with error color action button", () => {
      const html = render(() => (
        <RLConfirm open portal={false} variant="destructive" title="Permanently Delete" />
      ));
      expect(slotTag(html, "action")).toContain("rl-color-error");
    });
  });

  describe("Accessibility (WAI-ARIA)", () => {
    it("renders role='alertdialog' on dialog content", () => {
      const html = render(() => <RLConfirm open portal={false} title="Alert Dialog" />);
      const content = slotTag(html, "content");
      expect(attr(content, "role")).toBe("alertdialog");
      expect(attr(content, "aria-modal")).toBe("true");
    });

    it("links title and description automatically with ARIA attributes", () => {
      const html = render(() => (
        <RLConfirm open portal={false} title="Confirm Title" description="Confirm Description" />
      ));
      const content = slotTag(html, "content");
      const title = slotTag(html, "title");
      const desc = slotTag(html, "description");

      const titleId = attr(title, "id");
      const descId = attr(desc, "id");

      expect(titleId).toBeDefined();
      expect(descId).toBeDefined();
      expect(attr(content, "aria-labelledby")).toBe(titleId);
      expect(attr(content, "aria-describedby")).toBe(descId);
    });
  });

  describe("Custom UI and Classes", () => {
    it("applies class prop to root", () => {
      const html = render(() => <RLConfirm class="custom-confirm-root" />);
      expect(slotTag(html, "root")).toContain("custom-confirm-root");
    });

    it("applies ui slot overrides", () => {
      const html = render(() => (
        <RLConfirm
          open
          portal={false}
          title="Custom Styled"
          ui={{
            content: "custom-confirm-dialog",
            title: "custom-confirm-title-class",
            cancelButton: "custom-cancel-class",
            actionButton: "custom-action-class",
          }}
        />
      ));

      expect(slotTag(html, "content")).toContain("custom-confirm-dialog");
      expect(slotTag(html, "title")).toContain("custom-confirm-title-class");
      expect(slotTag(html, "cancel")).toContain("custom-cancel-class");
      expect(slotTag(html, "action")).toContain("custom-action-class");
    });
  });
});
