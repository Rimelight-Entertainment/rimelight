import { describe, it, expect } from "vite-plus/test";

import { RLDrawer } from "../src/components/drawer/RLDrawer";
import { renderSolid } from "./utils/normalize";

describe("RLDrawer", () => {
  describe("Trigger", () => {
    it("renders a trigger button labelled by triggerLabel", () => {
      const html = renderSolid(RLDrawer, { triggerLabel: "Open settings" });
      expect(html).toContain('data-slot="trigger"');
      expect(html).toContain("Open settings");
    });

    it("renders triggerSlot when no triggerLabel is set", () => {
      const html = renderSolid(RLDrawer, {
        triggerSlot: <span>Custom trigger</span>,
      });
      expect(html).toContain("Custom trigger");
      expect(html).not.toContain('data-slot="trigger"');
    });

    it("prefers triggerLabel over triggerSlot when both are set", () => {
      const html = renderSolid(RLDrawer, {
        triggerLabel: "Label wins",
        triggerSlot: <span>Slot loses</span>,
      });
      expect(html).toContain("Label wins");
      expect(html).not.toContain("Slot loses");
    });

    it("renders no trigger when neither triggerLabel nor triggerSlot is set", () => {
      const html = renderSolid(RLDrawer, {});
      expect(html).not.toContain('data-slot="trigger"');
    });
  });

  describe("Open state", () => {
    it("keeps the dialog out of the DOM while closed", () => {
      const html = renderSolid(RLDrawer, { triggerLabel: "Open" }, <p>Body text</p>);
      expect(html).not.toContain('data-slot="body"');
      expect(html).not.toContain("Body text");
    });

    it("renders the dialog and children when defaultOpen is true", () => {
      const html = renderSolid(RLDrawer, { defaultOpen: true }, <p>Body text</p>);
      expect(html).toContain('data-slot="body"');
      expect(html).toContain("Body text");
    });

    it("renders the dialog when controlled open is true", () => {
      const html = renderSolid(RLDrawer, { open: true }, <p>Body text</p>);
      expect(html).toContain('data-slot="body"');
    });
  });

  describe("Header content", () => {
    it("renders title and description strings in the header", () => {
      const html = renderSolid(RLDrawer, {
        open: true,
        title: "Account",
        description: "Manage your account",
      });
      expect(html).toContain('data-slot="title"');
      expect(html).toContain("Account");
      expect(html).toContain('data-slot="description"');
      expect(html).toContain("Manage your account");
    });

    it("omits title and description elements when their strings are not set", () => {
      const html = renderSolid(RLDrawer, { open: true });
      expect(html).not.toContain('data-slot="title"');
      expect(html).not.toContain('data-slot="description"');
    });

    it("renders titleSlot instead of the title string", () => {
      const html = renderSolid(RLDrawer, {
        open: true,
        title: "Ignored string",
        titleSlot: <strong>Slot title</strong>,
      });
      expect(html).toContain("Slot title");
      expect(html).not.toContain("Ignored string");
    });

    it("invokes a render-function titleSlot while open", () => {
      const html = renderSolid(RLDrawer, {
        open: true,
        titleSlot: () => <strong>Function title</strong>,
      });
      expect(html).toContain("Function title");
    });

    it("renders descriptionSlot instead of the description string", () => {
      const html = renderSolid(RLDrawer, {
        open: true,
        description: "Ignored description",
        descriptionSlot: <em>Slot description</em>,
      });
      expect(html).toContain("Slot description");
      expect(html).not.toContain("Ignored description");
    });
  });

  describe("Body and footer", () => {
    it("renders footerSlot in the footer region", () => {
      const html = renderSolid(RLDrawer, {
        open: true,
        footerSlot: <button type="button">Save</button>,
      });
      expect(html).toContain('data-slot="footer"');
      expect(html).toContain("Save");
    });

    it("omits the footer region when footerSlot is not set", () => {
      const html = renderSolid(RLDrawer, { open: true });
      expect(html).not.toContain('data-slot="footer"');
    });

    it("renders a render-function footerSlot while open", () => {
      const html = renderSolid(RLDrawer, {
        open: true,
        footerSlot: () => <button type="button">Function footer</button>,
      });
      expect(html).toContain("Function footer");
    });
  });

  describe("Dismissal", () => {
    it("renders the close button by default", () => {
      const html = renderSolid(RLDrawer, { open: true });
      expect(html).toContain('data-slot="close"');
    });

    it("removes the close button when dismissible is false", () => {
      const html = renderSolid(RLDrawer, { open: true, dismissible: false });
      expect(html).not.toContain('data-slot="close"');
    });
  });

  describe("Props boundaries", () => {
    it("does not leak side, open, or callback props to the DOM", () => {
      const html = renderSolid(RLDrawer, {
        side: "left",
        defaultOpen: true,
        onOpenChange: () => {},
        lockScroll: false,
        dismissible: true,
      });
      expect(html).not.toContain('side="');
      expect(html).not.toContain("defaultOpen");
      expect(html).not.toContain("lockScroll");
      expect(html).not.toContain("dismissible");
    });

    it("forwards id and data attributes to the root", () => {
      const html = renderSolid(RLDrawer, { id: "drawer-root", "data-testid": "drawer" });
      expect(html).toContain('id="drawer-root"');
      expect(html).toContain('data-testid="drawer"');
    });
  });
});
