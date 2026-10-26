import { builtinBlocks, defineBlock, defineCmsConfig } from "@rimelight/cms";
import {
  ApiDocumentationBlock,
  DialogueBlock,
  LivePreviewBlock,
  ScriptBlock,
  SceneBlock,
} from "#components/blocks";

const builtin = (type: string) => {
  const def = builtinBlocks.find((b) => b.type === type);
  if (!def) throw new Error(`Unknown built-in block: ${type}`);
  return def;
};

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
      // Rich text so a speaker can be a mention of their Character page, or plain text when the
      // character has no page.
      defaultProps: { character: [], parenthetical: "", line: [] },
      fields: {
        character: { type: "richtext", label: "Character" },
        parenthetical: { type: "text", label: "Parenthetical" },
      },
      inlineText: "line",
      richText: true,
      render: DialogueBlock,
    }),
    // Docs blocks: the site's renderers, registered so they can be inserted in the dashboard.
    defineBlock({
      type: "ApiDocumentationBlock",
      label: "API documentation",
      description: "A component's props, slots, emits and theme, generated from its source.",
      icon: "i-lucide-book-open",
      category: "embed",
      defaultProps: {
        componentName: "",
        sections: { props: true, slots: true, emits: true, theme: true, changelog: false },
        hide: [],
        show: [],
      },
      fields: {
        componentName: { type: "text", label: "Component", required: true },
        sections: { type: "json", label: "Sections" },
        hide: { type: "tags", label: "Hide props" },
        show: { type: "tags", label: "Only show props" },
      },
      render: ApiDocumentationBlock,
    }),
    // The built-in definition (fields, defaults) with the site's renderer instead of the generic one.
    defineBlock({ ...builtin("LivePreviewBlock"), render: LivePreviewBlock }),
  ],
});
