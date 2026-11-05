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
  describe("Trigger", () => {
    it("renders a trigger button from triggerLabel", () => {
      const html = render(() => <RLConfirm triggerLabel="Delete Item" />);
      expect(slotTag(html, "trigger")).not.toBe("");
      expect(html).toContain("Delete Item");
    });

    it("renders triggerSlot in place of the default trigger button", () => {
      const html = render(() => (
        <RLConfirm
          triggerLabel="Ignored label"
          triggerSlot={() => <span class="custom-confirm-trigger">Open dialog</span>}
        />
      ));

      expect(html).toContain("custom-confirm-trigger");
      expect(html).toContain("Open dialog");
      expect(html).not.toContain("Ignored label");
    });
  });

  describe("Dialog content", () => {
    it("renders title, description, and children when open", () => {
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
    });

    it("does not render the dialog when closed", () => {
      const html = render(() => <RLConfirm title="Hidden" />);
      expect(html).not.toContain("Hidden");
    });

    it("renders default cancel and action buttons with their labels", () => {
      const html = render(() => (
        <RLConfirm
          open
          portal={false}
          title="Discard Draft"
          actionLabel="Discard"
          cancelLabel="Keep Editing"
        />
      ));

      expect(html).toMatch(/data-slot="cancel-button"[^>]*>[\s\S]*?Keep Editing/);
      expect(html).toMatch(/data-slot="action-button"[^>]*>[\s\S]*?Discard/);
    });

    it("renders titleSlot and descriptionSlot in place of the string props", () => {
      const html = render(() => (
        <RLConfirm
          open
          portal={false}
          title="Ignored title"
          description="Ignored description"
          titleSlot={() => <h3 class="custom-confirm-title">Slot Title</h3>}
          descriptionSlot={() => <p class="custom-confirm-desc">Slot Description</p>}
        />
      ));

      expect(html).toContain("custom-confirm-title");
      expect(html).toContain("Slot Title");
      expect(html).toContain("custom-confirm-desc");
      expect(html).toContain("Slot Description");
      expect(html).not.toContain("Ignored title");
      expect(html).not.toContain("Ignored description");
    });

    it("replaces the default action row with footerSlot", () => {
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
      expect(slotTag(html, "cancel-button")).toBe("");
      expect(slotTag(html, "action-button")).toBe("");
    });
  });

  describe("Color", () => {
    it("renders primary action button by default", () => {
      const html = render(() => <RLConfirm open portal={false} title="Save Changes" />);
      expect(slotTag(html, "action-button")).toContain("rl-color-primary");
    });

    it("renders error action button when color='error'", () => {
      const html = render(() => (
        <RLConfirm open portal={false} color="error" title="Permanently Delete" />
      ));
      expect(slotTag(html, "action-button")).toContain("rl-color-error");
    });
  });

  describe("Accessibility (WAI-ARIA)", () => {
    it("renders role='alertdialog' and aria-modal on the dialog", () => {
      const html = render(() => <RLConfirm open portal={false} title="Alert Dialog" />);
      const content = slotTag(html, "content");
      expect(attr(content, "role")).toBe("alertdialog");
      expect(attr(content, "aria-modal")).toBe("true");
    });

    it("links title and description with aria-labelledby and aria-describedby", () => {
      const html = render(() => (
        <RLConfirm open portal={false} title="Confirm Title" description="Confirm Description" />
      ));
      const content = slotTag(html, "content");
      const titleId = attr(slotTag(html, "title"), "id");
      const descId = attr(slotTag(html, "description"), "id");

      expect(titleId).toBeDefined();
      expect(descId).toBeDefined();
      expect(attr(content, "aria-labelledby")).toBe(titleId);
      expect(attr(content, "aria-describedby")).toBe(descId);
    });

    it("forwards kebab-case aria-label to the dialog", () => {
      const html = render(() => (
        <RLConfirm open portal={false} title="Delete" aria-label="Delete confirmation" />
      ));

      expect(attr(slotTag(html, "content"), "aria-label")).toBe("Delete confirmation");
    });
  });

  describe("Custom UI and Classes", () => {
    it("applies class prop to root", () => {
      const html = render(() => <RLConfirm class="custom-confirm-root" />);
      expect(slotTag(html, "root")).toContain("custom-confirm-root");
    });

    it("applies ui overrides to the dialog, title, and action buttons", () => {
      const html = render(() => (
        <RLConfirm
          open
          portal={false}
          title="Custom Styled"
          ui={{
            cancelButton: "custom-cancel-class",
            actionButton: "custom-action-class",
          }}
        />
      ));

      expect(slotTag(html, "cancel-button")).toContain("custom-cancel-class");
      expect(slotTag(html, "action-button")).toContain("custom-action-class");
    });
  });
});
