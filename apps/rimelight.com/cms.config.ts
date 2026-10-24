import { defineBlock, defineCmsConfig } from "@rimelight/cms";
import { ScriptBlock, SceneBlock, DialogueBlock } from "#components/blocks";
import { franchiseCollections } from "#cms/collections";

/**
 * Rimelight-specific CMS setup: screenplay blocks and franchise page types are site concerns,
 * so they live here as examples of custom blocks/collections rather than in @rimelight/cms.
 */
export default defineCmsConfig({
  locales: ["en", "pt", "es"],
  collections: franchiseCollections,
  blocks: [
    defineBlock({
      type: "ScriptBlock",
      label: "Script",
      icon: "i-lucide-clapperboard",
      category: "screenplay",
      defaultProps: { title: "", synopsis: "", characters: [] },
      fields: {
        title: { type: "text", label: "Title" },
        synopsis: { type: "textarea", label: "Synopsis" },
        characters: { type: "tags", label: "Characters" },
        aPlot: { type: "textarea", label: "A plot" },
        bPlot: { type: "textarea", label: "B plot" },
        cPlot: { type: "textarea", label: "C plot" },
        stinger: { type: "textarea", label: "Stinger" },
      },
      children: ["SceneBlock"],
      render: ScriptBlock,
    }),
    defineBlock({
      type: "SceneBlock",
      label: "Scene",
      icon: "i-lucide-film",
      category: "screenplay",
      nestedOnly: true,
      defaultProps: { location: "", timeOfDay: "MORNING", setting: "INTERIOR", transition: "CUT_TO", description: "" },
      fields: {
        location: { type: "text", label: "Location" },
        setting: { type: "select", label: "Setting", options: ["INTERIOR", "EXTERIOR", "OTHER"].map((v) => ({ value: v, label: v })) },
        timeOfDay: { type: "select", label: "Time of day", options: ["MORNING", "NOON", "AFTERNOON", "EVENING", "NIGHT", "OTHER"].map((v) => ({ value: v, label: v })) },
        transition: { type: "select", label: "Transition", options: ["CUT_TO", "CUT_BACK_TO", "FADE_TO", "NONE"].map((v) => ({ value: v, label: v })) },
        description: { type: "textarea", label: "Description" },
      },
      children: ["DialogueBlock", "ParagraphBlock", "CalloutBlock"],
      render: SceneBlock,
    }),
    defineBlock({
      type: "DialogueBlock",
      label: "Dialogue",
      icon: "i-lucide-message-square-quote",
      category: "screenplay",
      nestedOnly: true,
      defaultProps: { character: "", line: "" },
      fields: { character: { type: "text", label: "Character" }, parenthetical: { type: "text", label: "Parenthetical" } },
      inlineText: "line",
      render: DialogueBlock,
    }),
  ],
});
