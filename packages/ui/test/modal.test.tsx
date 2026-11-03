import { describe, it, expect } from "vite-plus/test";

import { RLModal } from "../src/components/modal/RLModal";
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

describe("RLModal", () => {
  describe("Exports", () => {
    it("exports RLModal component from index", () => {
      expect(RLModal).toBeDefined();
    });
  });

  describe("Structure & Trigger", () => {
    it("renders trigger button when triggerLabel is provided", () => {
      const html = render(() => <RLModal triggerLabel="Open Modal" />);
      expect(slotTag(html, "trigger")).not.toBe("");
      expect(html).toContain("Open Modal");
      // Default closed and unmounted
      expect(slotTag(html, "content")).toBe("");
    });

    it("renders custom trigger element", () => {
      const html = render(() => (
        <RLModal
          triggerSlot={
            <button type="button" class="my-custom-btn">
              Launch
            </button>
          }
        />
      ));
      expect(html).toContain("my-custom-btn");
      expect(html).toContain("Launch");
    });

    it("renders triggerSlot", () => {
      const html = render(() => (
        <RLModal triggerSlot={<span class="badge-trigger">Click me</span>} />
      ));
      expect(html).toContain("badge-trigger");
      expect(html).toContain("Click me");
    });
  });

  describe("Open States & UnmountOnHide", () => {
    it("renders open modal with open={true}", () => {
      const html = render(() => (
        <RLModal open portal={false} title="Modal Title" description="Modal Description">
          Modal Body Content
        </RLModal>
      ));
      expect(slotTag(html, "content")).not.toBe("");
      expect(slotTag(html, "overlay")).not.toBe("");
      expect(slotTag(html, "title")).not.toBe("");
      expect(slotTag(html, "description")).not.toBe("");
      expect(slotTag(html, "body")).not.toBe("");
      expect(html).toContain("Modal Title");
      expect(html).toContain("Modal Description");
      expect(html).toContain("Modal Body Content");
    });

    it("renders open modal with defaultOpen={true}", () => {
      const html = render(() => (
        <RLModal defaultOpen portal={false} title="Uncontrolled Title">
          Body
        </RLModal>
      ));
      expect(slotTag(html, "content")).not.toBe("");
      expect(html).toContain("Uncontrolled Title");
    });

    it("keeps content in DOM when open={false} and unmountOnHide={false}", () => {
      const html = render(() => (
        <RLModal open={false} unmountOnHide={false} portal={false} title="Persisted Title">
          Persisted Body
        </RLModal>
      ));
      expect(slotTag(html, "content")).not.toBe("");
      expect(html).toContain("Persisted Title");
      expect(html).toContain("Persisted Body");
      expect(attr(slotTag(html, "content"), "data-state")).toBe("closed");
    });

    it("unmounts dialog tree when open={false} and unmountOnHide={true}", () => {
      const html = render(() => (
        <RLModal open={false} unmountOnHide={true} portal={false} title="Hidden">
          Body
        </RLModal>
      ));
      expect(slotTag(html, "content")).toBe("");
      expect(html).not.toContain("Hidden");
    });
  });

  describe("Slots & Structure", () => {
    it("prefers titleSlot and descriptionSlot over props", () => {
      const html = render(() => (
        <RLModal
          open
          portal={false}
          title="Prop Title"
          description="Prop Desc"
          titleSlot={() => <h3 class="custom-title-slot">Slot Title</h3>}
          descriptionSlot={() => <p class="custom-desc-slot">Slot Desc</p>}
        />
      ));
      expect(html).toContain("custom-title-slot");
      expect(html).toContain("Slot Title");
      expect(html).toContain("custom-desc-slot");
      expect(html).toContain("Slot Desc");
      expect(html).not.toContain("Prop Title");
      expect(html).not.toContain("Prop Desc");
    });

    it("renders custom header slot directly", () => {
      const html = render(() => (
        <RLModal
          open
          portal={false}
          title="Ignored"
          headerSlot={() => <div class="custom-header">Custom Header Content</div>}
        >
          Body
        </RLModal>
      ));
      expect(html).toContain("custom-header");
      expect(html).toContain("Custom Header Content");
      expect(html).not.toContain("Ignored");
    });

    it("renders custom actions slot in header", () => {
      const html = render(() => (
        <RLModal
          open
          portal={false}
          title="Modal Header"
          actionsSlot={() => (
            <button type="button" class="header-action-btn">
              Action
            </button>
          )}
        />
      ));
      expect(slotTag(html, "actions")).not.toBe("");
      expect(html).toContain("header-action-btn");
      expect(html).toContain("Action");
    });

    it("renders footerSlot", () => {
      const html = render(() => (
        <RLModal
          open
          portal={false}
          footerSlot={() => <div class="slot-footer">Slot Footer</div>}
        />
      ));
      expect(slotTag(html, "footer")).not.toBe("");
      expect(html).toContain("Slot Footer");
    });

    it("renders contentSlot overriding whole dialog contents", () => {
      const html = render(() => (
        <RLModal
          open
          portal={false}
          title="Ignored"
          contentSlot={() => <div class="entire-content-override">Override All</div>}
        />
      ));
      expect(html).toContain("entire-content-override");
      expect(html).toContain("Override All");
      expect(slotTag(html, "header")).toBe("");
      expect(html).not.toContain("Ignored");
    });
  });

  describe("Close Button", () => {
    it("renders default close button in header", () => {
      const html = render(() => <RLModal open portal={false} title="Title" />);
      expect(slotTag(html, "close")).not.toBe("");
      expect(attr(slotTag(html, "close"), "aria-label")).toBe("Close modal");
    });

    it("hides close button when close={false}", () => {
      const html = render(() => <RLModal open portal={false} close={false} title="Title" />);
      expect(slotTag(html, "close")).toBe("");
    });

    it("supports custom close button props", () => {
      const html = render(() => (
        <RLModal
          open
          portal={false}
          title="Title"
          close={{ color: "primary", variant: "outline", class: "custom-close-btn" }}
        />
      ));
      expect(html).toContain("custom-close-btn");
    });

    it("renders custom closeSlot override", () => {
      const html = render(() => (
        <RLModal
          open
          portal={false}
          title="Title"
          closeSlot={() => (
            <button type="button" class="slot-close">
              X
            </button>
          )}
        />
      ));
      expect(html).toContain("slot-close");
      expect(html).toContain("X");
    });
  });

  describe("Variants, Sizes & Modes", () => {
    const sizes = ["xs", "sm", "md", "lg", "xl", "fullscreen"] as const;

    for (const size of sizes) {
      it(`renders size=${size} correctly`, () => {
        const html = render(() => (
          <RLModal open portal={false} size={size} title={`Size ${size}`} />
        ));
        expect(html).toContain(`Size ${size}`);
        expect(slotTag(html, "content")).not.toBe("");
      });
    }

    it("renders fullscreen={true}", () => {
      const html = render(() => (
        <RLModal open portal={false} fullscreen title="Fullscreen Modal" />
      ));
      const content = slotTag(html, "content");
      expect(content).toContain("fixed inset-0");
    });

    it("renders scrollable={true} placing content in scrollable overlay", () => {
      const html = render(() => (
        <RLModal open portal={false} scrollable title="Scrollable Modal" />
      ));
      const overlay = slotTag(html, "overlay");
      expect(overlay).toContain("overflow-y-auto");
    });

    it("applies transparent background when overlay={false}", () => {
      const html = render(() => (
        <RLModal open portal={false} overlay={false} title="No Overlay Background" />
      ));
      expect(slotTag(html, "overlay")).toContain("bg-transparent");
      expect(slotTag(html, "content")).not.toBe("");
    });

    it("disables modal overlay interaction when modal={false}", () => {
      const html = render(() => <RLModal open portal={false} modal={false} title="Non-modal" />);
      expect(slotTag(html, "overlay")).toContain("pointer-events-none");
      expect(slotTag(html, "content")).not.toBe("");
    });
  });

  describe("Accessibility (WAI-ARIA)", () => {
    it("renders role='dialog' and aria-modal='true' by default", () => {
      const html = render(() => <RLModal open portal={false} title="Accessible Modal" />);
      const content = slotTag(html, "content");
      expect(attr(content, "role")).toBe("dialog");
      expect(attr(content, "aria-modal")).toBe("true");
    });

    it("automatically links title and description with aria-labelledby and aria-describedby", () => {
      const html = render(() => (
        <RLModal open portal={false} title="Accessible Title" description="Accessible Desc" />
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

    it("supports explicit ariaLabel, ariaLabelledby, ariaDescribedby and role", () => {
      const html = render(() => (
        <RLModal
          open
          portal={false}
          role="alertdialog"
          ariaLabel="Custom Label"
          ariaLabelledby="custom-title-id"
          ariaDescribedby="custom-desc-id"
        />
      ));
      const content = slotTag(html, "content");
      expect(attr(content, "role")).toBe("alertdialog");
      expect(attr(content, "aria-label")).toBe("Custom Label");
      expect(attr(content, "aria-labelledby")).toBe("custom-title-id");
      expect(attr(content, "aria-describedby")).toBe("custom-desc-id");
    });
  });

  describe("Custom UI and Classes", () => {
    it("applies class prop to root", () => {
      const html = render(() => <RLModal class="custom-modal-root" />);
      expect(slotTag(html, "root")).toContain("custom-modal-root");
    });

    it("applies ui slot overrides across elements", () => {
      const html = render(() => (
        <RLModal
          open
          portal={false}
          title="Custom Title"
          description="Custom Description"
          footerSlot={() => "Custom Footer"}
          ui={{
            root: "custom-root-class",
            overlay: "custom-overlay-class",
            content: "custom-content-class",
            header: "custom-header-class",
            title: "custom-title-class",
            description: "custom-desc-class",
            body: "custom-body-class",
            footer: "custom-footer-class",
            close: "custom-close-class",
          }}
        >
          Body
        </RLModal>
      ));
      expect(slotTag(html, "root")).toContain("custom-root-class");
      expect(slotTag(html, "overlay")).toContain("custom-overlay-class");
      expect(slotTag(html, "content")).toContain("custom-content-class");
      expect(slotTag(html, "header")).toContain("custom-header-class");
      expect(slotTag(html, "title")).toContain("custom-title-class");
      expect(slotTag(html, "description")).toContain("custom-desc-class");
      expect(slotTag(html, "body")).toContain("custom-body-class");
      expect(slotTag(html, "footer")).toContain("custom-footer-class");
      expect(slotTag(html, "close")).toContain("custom-close-class");
    });
  });
});
