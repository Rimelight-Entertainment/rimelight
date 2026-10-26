import { defineBlock, defineCmsConfig } from "@rimelight/cms";
import { ScriptBlock, SceneBlock, DialogueBlock } from "#components/blocks";

/**
 * Rimelight-specific CMS setup: screenplay blocks are a site concern, so they live here as an
 * example of custom blocks rather than in @rimelight/cms. Collections (including the franchise
 * types) are created in the CMS dashboard and stored in the database.
 */
export default defineCmsConfig({
  locales: ["en", "pt", "es"],
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
      // Scenes only exist inside a script: they can't be created or dropped anywhere else.
      parents: ["ScriptBlock"],
      defaultProps: {
        location: "",
        timeOfDay: "MORNING",
        setting: "INTERIOR",
        transition: "CUT_TO",
        description: [],
      },
      fields: {
        location: { type: "text", label: "Location" },
        setting: {
          type: "select",
          label: "Setting",
          options: ["INTERIOR", "EXTERIOR", "OTHER"].map((v) => ({ value: v, label: v })),
        },
        timeOfDay: {
          type: "select",
          label: "Time of day",
          options: ["MORNING", "NOON", "AFTERNOON", "EVENING", "NIGHT", "OTHER"].map((v) => ({
            value: v,
            label: v,
          })),
        },
        transition: {
          type: "select",
          label: "Transition",
          options: ["CUT_TO", "CUT_BACK_TO", "FADE_TO", "NONE"].map((v) => ({
            value: v,
            label: v,
          })),
        },
        description: { type: "richtext", label: "Description" },
      },
      children: ["DialogueBlock", "ParagraphBlock", "CalloutBlock"],
      render: SceneBlock,
    }),
    defineBlock({
      type: "DialogueBlock",
      label: "Dialogue",
      icon: "i-lucide-message-square-quote",
      category: "screenplay",
      parents: ["SceneBlock"],
      defaultProps: { character: "", line: [] },
      fields: {
        character: { type: "text", label: "Character" },
        parenthetical: { type: "text", label: "Parenthetical" },
      },
      inlineText: "line",
      richText: true,
      render: DialogueBlock,
    }),
  ],
});
