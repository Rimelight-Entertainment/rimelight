import { describe, expect, it } from "vite-plus/test";
import {
  ALLOWED_CHILDREN_MAP,
  MAX_SECTION_DEPTH,
  calculateHeadingLevel,
} from "../src/core/types/blocks";
import { toast, toasts, clearToasts } from "../src/client/toast";
import { createEditorState } from "../src/client/state/editor-store";

describe("block-hierarchy-and-rules", () => {
  it("enforces allowed children rules for ScriptBlock", () => {
    const allowedInScript = ALLOWED_CHILDREN_MAP["ScriptBlock"];
    expect(allowedInScript).toEqual(["SceneBlock"]);
  });

  it("enforces allowed children rules for SceneBlock", () => {
    const allowedInScene = ALLOWED_CHILDREN_MAP["SceneBlock"];
    expect(allowedInScene).toEqual(["ParagraphBlock", "CalloutBlock", "DialogueBlock"]);
  });

  it("enforces allowed children rules for CalloutBlock", () => {
    const allowedInCallout = ALLOWED_CHILDREN_MAP["CalloutBlock"];
    expect(allowedInCallout).toEqual([
      "ParagraphBlock",
      "CalloutBlock",
      "ImageBlock",
      "CodeBlock",
      "TableBlock",
      "TabsBlock",
      "StepsBlock",
      "CardsBlock",
      "FileTreeBlock",
      "ComponentShowcaseBlock",
      "ApiDocumentationBlock",
      "LivePreviewBlock",
    ]);
  });

  it("enforces allowed children rules for SectionBlock", () => {
    const allowedInSection = ALLOWED_CHILDREN_MAP["SectionBlock"];
    expect(allowedInSection).toEqual([
      "SectionBlock",
      "ParagraphBlock",
      "CalloutBlock",
      "ImageBlock",
      "CodeBlock",
      "ScriptBlock",
      "TableBlock",
      "TabsBlock",
      "StepsBlock",
      "CardsBlock",
      "FileTreeBlock",
      "ComponentShowcaseBlock",
      "ApiDocumentationBlock",
      "LivePreviewBlock",
    ]);
  });

  it("allows all primary blocks at root level", () => {
    const allowedAtRoot = ALLOWED_CHILDREN_MAP["Root"];
    expect(allowedAtRoot).toContain("ParagraphBlock");
    expect(allowedAtRoot).toContain("SectionBlock");
    expect(allowedAtRoot).toContain("ImageBlock");
    expect(allowedAtRoot).toContain("CalloutBlock");
    expect(allowedAtRoot).toContain("CodeBlock");
    expect(allowedAtRoot).toContain("ScriptBlock");
    expect(allowedAtRoot).toContain("SceneBlock");
    expect(allowedAtRoot).toContain("DialogueBlock");
  });

  describe("dynamic heading level calculations", () => {
    it("starts at H2 for root sections (depth 0)", () => {
      expect(calculateHeadingLevel(0)).toBe(2);
    });

    it("calculates sequential heading levels (H3, H4, H5, H6) based on nesting depth", () => {
      expect(calculateHeadingLevel(1)).toBe(3);
      expect(calculateHeadingLevel(2)).toBe(4);
      expect(calculateHeadingLevel(3)).toBe(5);
      expect(calculateHeadingLevel(4)).toBe(6);
    });

    it("caps at H6 and never returns invalid heading levels", () => {
      expect(calculateHeadingLevel(5)).toBe(6);
      expect(calculateHeadingLevel(10)).toBe(6);
      expect(MAX_SECTION_DEPTH).toBe(4);
    });
  });

  describe("toast API", () => {
    it("dispatches error, success, warning, and info toasts", () => {
      clearToasts();
      expect(toasts).toHaveLength(0);

      const errToast = toast.error("Test Error", "Something went wrong");
      expect(errToast.variant).toBe("error");
      expect(errToast.title).toBe("Test Error");
      expect(toasts).toHaveLength(1);

      const successToast = toast.success("Saved", "Document saved");
      expect(successToast.variant).toBe("success");
      expect(toasts).toHaveLength(2);

      toast.remove(errToast.id);
      expect(toasts).toHaveLength(1);
      expect(toasts[0]!.id).toBe(successToast.id);

      clearToasts();
      expect(toasts).toHaveLength(0);
    });
  });

  describe("editor store section nesting enforcement", () => {
    it("allows inserting sections from H2 down to H6", () => {
      clearToasts();
      const state = createEditorState([], "test-page");

      // Insert root section (depth 0 -> H2)
      state.insertBlock("SectionBlock", null, "after", null);
      expect(state.blocks).toHaveLength(1);
      const secH2Id = state.blocks[0]!.id;

      // Insert nested section (depth 1 -> H3)
      state.insertBlock("SectionBlock", null, "after", secH2Id);
      expect(state.blocks[0]!.props["children"]).toHaveLength(1);
      const secH3Id = state.blocks[0]!.props["children"][0]!.id;

      // Insert nested section (depth 2 -> H4)
      state.insertBlock("SectionBlock", null, "after", secH3Id);
      expect(state.blocks[0]!.props["children"][0]!.props["children"]).toHaveLength(1);
      const secH4Id = state.blocks[0]!.props["children"][0]!.props["children"][0]!.id;

      // Insert nested section (depth 3 -> H5)
      state.insertBlock("SectionBlock", null, "after", secH4Id);
      expect(
        state.blocks[0]!.props["children"][0]!.props["children"][0]!.props["children"],
      ).toHaveLength(1);
      const secH5Id =
        state.blocks[0]!.props["children"][0]!.props["children"][0]!.props["children"][0]!.id;

      // Insert nested section (depth 4 -> H6)
      state.insertBlock("SectionBlock", null, "after", secH5Id);
      expect(
        state.blocks[0]!.props["children"][0]!.props["children"][0]!.props["children"][0]!.props[
          "children"
        ],
      ).toHaveLength(1);
      const secH6Id =
        state.blocks[0]!.props["children"][0]!.props["children"][0]!.props["children"][0]!.props[
          "children"
        ][0]!.id;

      // Try inserting another section inside H6 (depth 5 -> would be H7, invalid!)
      state.insertBlock("SectionBlock", null, "after", secH6Id);
      expect(
        state.blocks[0]!.props["children"][0]!.props["children"][0]!.props["children"][0]!.props[
          "children"
        ][0]!.props["children"] || [],
      ).toHaveLength(0);

      // Toast error should have been dispatched
      const activeToasts = [...toasts];
      expect(activeToasts.length).toBeGreaterThan(0);
      expect(
        activeToasts.some(
          (t: any) => t.variant === "error" && t.title.includes("Invalid Section Nesting"),
        ),
      ).toBe(true);
    });
  });
});
