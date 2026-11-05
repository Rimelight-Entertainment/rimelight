import { describe, it, expect } from "vite-plus/test";

import { RLFileUpload } from "../src/components/file-upload/RLFileUpload";
import { renderSolid } from "./utils/normalize";

describe("RLFileUpload", () => {
  describe("Structure", () => {
    it("renders a focusable button-role root with the file upload flag", () => {
      const html = renderSolid(RLFileUpload, { title: "Upload" });
      expect(html).toContain('role="button"');
      expect(html).toContain('tabindex="0"');
      expect(html).toContain("data-file-upload");
      expect(html).toContain('data-slot="root"');
    });

    it("renders a hidden file input with the input flag", () => {
      const html = renderSolid(RLFileUpload, { title: "Upload" });
      expect(html).toContain('type="file"');
      expect(html).toContain("data-file-upload-input");
    });

    it("renders the live file list region", () => {
      const html = renderSolid(RLFileUpload, { title: "Upload" });
      expect(html).toContain("data-file-upload-filelist");
      expect(html).toContain('aria-live="polite"');
    });

    it("renders the root as the element given by the as prop", () => {
      const html = renderSolid(RLFileUpload, { as: "section", title: "Upload" });
      expect(html).toMatch(/^<section/);
    });
  });

  describe("Content", () => {
    it("renders the title and description strings", () => {
      const html = renderSolid(RLFileUpload, {
        title: "Drop your avatar",
        description: "PNG or JPG",
      });
      expect(html).toContain("Drop your avatar");
      expect(html).toContain("PNG or JPG");
    });

    it("omits the description element when no description is set", () => {
      const html = renderSolid(RLFileUpload, { title: "Upload" });
      expect(html).not.toContain('data-slot="description"');
    });

    it("shows the accept hint with the accepted value when accept is set", () => {
      const html = renderSolid(RLFileUpload, { title: "Upload", accept: "image/*" });
      expect(html).toContain("image/*");
      expect(html).toContain('accept="image/*"');
    });

    it("replaces the title, description, and accept hint with children", () => {
      const html = renderSolid(
        RLFileUpload,
        { title: "Hidden title", description: "Hidden description", accept: "image/*" },
        <p>Custom drop copy</p>,
      );
      expect(html).toContain("Custom drop copy");
      expect(html).not.toMatch(/>\s*Hidden title\s*</);
      expect(html).not.toContain("Hidden description");
      expect(html).not.toContain('data-slot="title"');
    });
  });

  describe("Icon slot", () => {
    it("renders iconSlot in place of the default icon", () => {
      const html = renderSolid(RLFileUpload, {
        title: "Upload",
        iconSlot: <span>Custom icon</span>,
      });
      expect(html).toContain("Custom icon");
    });

    it("invokes a render-function iconSlot", () => {
      const html = renderSolid(RLFileUpload, {
        title: "Upload",
        iconSlot: () => <span>Function icon</span>,
      });
      expect(html).toContain("Function icon");
    });
  });

  describe("Input configuration", () => {
    it("forwards multiple to the file input", () => {
      const html = renderSolid(RLFileUpload, { title: "Upload", multiple: true });
      expect(html).toContain("multiple");
    });

    it("omits the multiple attribute by default", () => {
      const html = renderSolid(RLFileUpload, { title: "Upload" });
      expect(html).not.toContain("multiple");
    });
  });

  describe("Disabled state", () => {
    it("marks the root with a presence data-disabled flag and removes it from tab order", () => {
      const html = renderSolid(RLFileUpload, { title: "Upload", disabled: true });
      expect(html).toContain("data-disabled");
      expect(html).not.toContain('data-disabled="true"');
      expect(html).toContain('tabindex="-1"');
    });

    it("disables the file input", () => {
      const html = renderSolid(RLFileUpload, { title: "Upload", disabled: true });
      expect(html).toContain("disabled");
    });

    it("omits data-disabled when enabled", () => {
      const html = renderSolid(RLFileUpload, { title: "Upload" });
      expect(html).not.toContain("data-disabled");
    });
  });

  describe("Props boundaries", () => {
    it("does not leak upload-specific props to the DOM", () => {
      const html = renderSolid(RLFileUpload, {
        title: "Upload",
        icon: "lucide:file",
        onValueChange: () => {},
      });
      expect(html).not.toContain('icon="');
      expect(html).not.toContain("onValueChange");
    });

    it("forwards id and data attributes to the root", () => {
      const html = renderSolid(RLFileUpload, {
        id: "avatar-upload",
        title: "Upload",
        "data-testid": "avatar-upload-root",
      });
      expect(html).toContain('id="avatar-upload"');
      expect(html).toContain('data-testid="avatar-upload-root"');
    });
  });
});
