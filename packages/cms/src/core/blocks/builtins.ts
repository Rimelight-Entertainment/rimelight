import { defineBlock, type BlockDefinition } from "./registry";
import { createBlockId } from "./tree";

/**
 * Built-in block definitions (data only). Prop names here are the single source of truth and
 * match the renderers in `solid/blocks/*` and the typed interfaces in `core/types/blocks.ts`.
 * Renderers are attached in `solid/blocks/index.ts` so this module stays framework-free.
 */

const variants = ["info", "success", "warning", "error", "commentary", "ideation", "source"];

export const builtinBlocks: BlockDefinition<any>[] = [
  defineBlock({
    type: "ParagraphBlock",
    label: { en: "Text", es: "Text", pt: "Text" },
    description: {
      en: "Plain text with inline formatting, links and mentions.",
      es: "Plain text with inline formatting, links and mentions.",
      pt: "Plain text with inline formatting, links and mentions.",
    },
    icon: "i-lucide-pilcrow",
    category: "text",
    keywords: ["paragraph", "p", "text"],
    defaultProps: { text: [] },
    inlineText: "text",
    richText: true,
  }),
  defineBlock({
    type: "SectionBlock",
    label: { en: "Section", es: "Section", pt: "Section" },
    description: {
      en: "Heading that groups the blocks below it. Nest sections for H3–H6.",
      es: "Heading that groups the blocks below it. Nest sections for H3–H6.",
      pt: "Heading that groups the blocks below it. Nest sections for H3–H6.",
    },
    icon: "i-lucide-heading",
    category: "structure",
    keywords: ["heading", "h2", "h3", "title"],
    defaultProps: { title: [] },
    fields: {
      title: { type: "richtext", label: { en: "Heading", es: "Heading", pt: "Heading" } },
      description: { type: "richtext", label: { en: "Subtitle", es: "Subtitle", pt: "Subtitle" } },
      mainArticleSlug: {
        type: "text",
        label: { en: "Main article slug", es: "Main article slug", pt: "Main article slug" },
      },
    },
    inlineText: "title",
    richText: true,
    children: "*",
    // h2 … h6: a section inside five others would need an h7.
    maxNesting: 5,
  }),
  defineBlock({
    type: "CalloutBlock",
    label: { en: "Callout", es: "Callout", pt: "Callout" },
    description: {
      en: "Highlighted box for notes, warnings and tips.",
      es: "Highlighted box for notes, warnings and tips.",
      pt: "Highlighted box for notes, warnings and tips.",
    },
    icon: "i-lucide-info",
    category: "text",
    keywords: ["note", "warning", "tip", "admonition"],
    defaultProps: { variant: "info" },
    fields: {
      variant: {
        type: "select",
        label: { en: "Variant", es: "Variant", pt: "Variant" },
        options: variants.map((v) => ({ value: v, label: v[0]!.toUpperCase() + v.slice(1) })),
      },
      to: { type: "url", label: { en: "Link", es: "Link", pt: "Link" } },
    },
    children: [
      "ParagraphBlock",
      "UnorderedListBlock",
      "OrderedListBlock",
      "ImageBlock",
      "CodeBlock",
      "TableBlock",
    ],
    initialChildren: () => [{ id: createBlockId(), type: "ParagraphBlock", props: { text: [] } }],
  }),
  defineBlock({
    type: "UnorderedListBlock",
    label: { en: "Bulleted list", es: "Bulleted list", pt: "Bulleted list" },
    icon: "i-lucide-list",
    category: "text",
    keywords: ["ul", "bullets"],
    defaultProps: {},
    children: ["ListItemBlock"],
    initialChildren: () => [{ id: createBlockId(), type: "ListItemBlock", props: { content: [] } }],
  }),
  defineBlock({
    type: "OrderedListBlock",
    label: { en: "Numbered list", es: "Numbered list", pt: "Numbered list" },
    icon: "i-lucide-list-ordered",
    category: "text",
    keywords: ["ol", "numbers"],
    defaultProps: {},
    children: ["ListItemBlock"],
    initialChildren: () => [{ id: createBlockId(), type: "ListItemBlock", props: { content: [] } }],
  }),
  defineBlock({
    type: "ListItemBlock",
    label: { en: "List item", es: "List item", pt: "List item" },
    icon: "i-lucide-dot",
    category: "text",
    nestedOnly: true,
    children: ["UnorderedListBlock", "OrderedListBlock"],
    parents: ["UnorderedListBlock", "OrderedListBlock"],
    defaultProps: { content: [] },
    inlineText: "content",
    richText: true,
  }),
  defineBlock({
    type: "ImageBlock",
    label: { en: "Image", es: "Image", pt: "Image" },
    icon: "i-lucide-image",
    category: "media",
    keywords: ["picture", "photo", "media"],
    defaultProps: { src: "", alt: "" },
    fields: {
      src: {
        type: "media",
        label: { en: "Image", es: "Image", pt: "Image" },
        required: true,
        autofill: { alt: "alt", caption: "caption" },
      },
      alt: {
        type: "text",
        translatable: true,
        label: { en: "Alt text", es: "Alt text", pt: "Alt text" },
        required: true,
      },
      caption: {
        type: "text",
        translatable: true,
        label: { en: "Caption", es: "Caption", pt: "Caption" },
      },
      width: { type: "number", label: { en: "Width", es: "Width", pt: "Width" } },
      height: { type: "number", label: { en: "Height", es: "Height", pt: "Height" } },
    },
  }),
  defineBlock({
    type: "CodeBlock",
    label: { en: "Code", es: "Code", pt: "Code" },
    icon: "i-lucide-code",
    category: "text",
    keywords: ["snippet", "pre"],
    defaultProps: { code: "", language: "ts" },
    fields: {
      language: { type: "text", label: { en: "Language", es: "Language", pt: "Language" } },
      filename: { type: "text", label: { en: "Filename", es: "Filename", pt: "Filename" } },
      showLineNumbers: {
        type: "boolean",
        label: { en: "Line numbers", es: "Line numbers", pt: "Line numbers" },
      },
      code: { type: "textarea", label: { en: "Code", es: "Code", pt: "Code" } },
    },
  }),
  defineBlock({
    type: "TableBlock",
    label: { en: "Table", es: "Table", pt: "Table" },
    icon: "i-lucide-table",
    category: "data",
    defaultProps: {
      columns: [
        { key: "a", header: "Column A" },
        { key: "b", header: "Column B" },
      ],
      rows: [{ a: "", b: "" }],
    },
    fields: {
      caption: { type: "text", label: { en: "Caption", es: "Caption", pt: "Caption" } },
      striped: {
        type: "boolean",
        label: { en: "Striped", es: "Striped", pt: "Striped" },
        defaultValue: true,
      },
      bordered: { type: "boolean", label: { en: "Bordered", es: "Bordered", pt: "Bordered" } },
    },
  }),
  defineBlock({
    type: "TabsBlock",
    label: { en: "Tabs", es: "Tabs", pt: "Tabs" },
    icon: "i-lucide-panels-top-left",
    category: "structure",
    defaultProps: {},
    children: ["TabItemBlock"],
    initialChildren: () => [
      {
        id: createBlockId(),
        type: "TabItemBlock",
        props: { label: { en: "Tab 1", es: "Tab 1", pt: "Tab 1" } },
        children: [],
      },
    ],
  }),
  defineBlock({
    type: "TabItemBlock",
    label: { en: "Tab", es: "Tab", pt: "Tab" },
    icon: "i-lucide-panel-top",
    category: "structure",
    nestedOnly: true,
    parents: ["TabsBlock"],
    defaultProps: { label: "Tab" },
    fields: {
      label: { type: "text", label: { en: "Label", es: "Label", pt: "Label" } },
      icon: { type: "text", label: { en: "Icon", es: "Icon", pt: "Icon" } },
    },
    inlineText: "label",
    children: "*",
  }),
  defineBlock({
    type: "StepsBlock",
    label: { en: "Steps", es: "Steps", pt: "Steps" },
    icon: "i-lucide-list-checks",
    category: "structure",
    keywords: ["guide", "walkthrough"],
    defaultProps: {},
    children: ["StepItemBlock"],
    initialChildren: () => [
      {
        id: createBlockId(),
        type: "StepItemBlock",
        props: { title: [{ type: "text", text: "Step 1" }] },
        children: [],
      },
    ],
  }),
  defineBlock({
    type: "StepItemBlock",
    label: { en: "Step", es: "Step", pt: "Step" },
    icon: "i-lucide-circle-check",
    category: "structure",
    nestedOnly: true,
    parents: ["StepsBlock"],
    defaultProps: { title: [] },
    fields: {
      title: { type: "richtext", label: { en: "Title", es: "Title", pt: "Title" } },
      description: {
        type: "textarea",
        label: { en: "Description", es: "Description", pt: "Description" },
      },
    },
    inlineText: "title",
    richText: true,
    children: "*",
  }),
  defineBlock({
    type: "CardsBlock",
    label: { en: "Cards", es: "Cards", pt: "Cards" },
    icon: "i-lucide-layout-grid",
    category: "structure",
    defaultProps: { columns: 2 },
    fields: {
      columns: {
        type: "select",
        label: { en: "Columns", es: "Columns", pt: "Columns" },
        options: ["1", "2", "3", "4"].map((v) => ({ value: v, label: v })),
      },
    },
    children: ["CardBlock"],
    initialChildren: () => [{ id: createBlockId(), type: "CardBlock", props: { title: "Card" } }],
  }),
  defineBlock({
    type: "CardBlock",
    label: { en: "Card", es: "Card", pt: "Card" },
    icon: "i-lucide-square",
    category: "structure",
    nestedOnly: true,
    parents: ["CardsBlock"],
    defaultProps: { title: "" },
    fields: {
      title: { type: "text", label: { en: "Title", es: "Title", pt: "Title" } },
      description: {
        type: "textarea",
        label: { en: "Description", es: "Description", pt: "Description" },
      },
      icon: { type: "text", label: { en: "Icon", es: "Icon", pt: "Icon" } },
      href: { type: "url", label: { en: "Link", es: "Link", pt: "Link" } },
      badge: { type: "text", label: { en: "Badge", es: "Badge", pt: "Badge" } },
    },
  }),
  defineBlock({
    type: "FileTreeBlock",
    label: { en: "File tree", es: "File tree", pt: "File tree" },
    icon: "i-lucide-folder-tree",
    category: "data",
    defaultProps: { tree: [] },
    fields: { tree: { type: "json", label: { en: "Tree", es: "Tree", pt: "Tree" } } },
  }),
  defineBlock({
    type: "LivePreviewBlock",
    label: { en: "Live preview", es: "Live preview", pt: "Live preview" },
    icon: "i-lucide-play",
    category: "embed",
    defaultProps: { componentCode: "", framework: "solid", height: "320px" },
    fields: {
      componentCode: {
        type: "textarea",
        label: { en: "Component code", es: "Component code", pt: "Component code" },
      },
      height: { type: "text", label: { en: "Height", es: "Height", pt: "Height" } },
      editable: { type: "boolean", label: { en: "Editable", es: "Editable", pt: "Editable" } },
    },
  }),
  defineBlock({
    type: "DividerBlock",
    label: { en: "Divider", es: "Divider", pt: "Divider" },
    description: {
      en: "Horizontal rule that separates parts of a page.",
      es: "Horizontal rule that separates parts of a page.",
      pt: "Horizontal rule that separates parts of a page.",
    },
    icon: "i-lucide-minus",
    category: "text",
    keywords: ["hr", "line", "separator", "rule"],
    defaultProps: {},
  }),
  defineBlock({
    type: "QuoteBlock",
    label: { en: "Quote", es: "Quote", pt: "Quote" },
    description: {
      en: "Pulled quotation with an optional attribution.",
      es: "Pulled quotation with an optional attribution.",
      pt: "Pulled quotation with an optional attribution.",
    },
    icon: "i-lucide-quote",
    category: "text",
    keywords: ["blockquote", "citation"],
    defaultProps: { text: [], attribution: "" },
    fields: {
      attribution: {
        type: "text",
        label: { en: "Attribution", es: "Attribution", pt: "Attribution" },
      },
    },
    inlineText: "text",
    richText: true,
  }),
  defineBlock({
    type: "EmbedBlock",
    label: { en: "Video", es: "Video", pt: "Video" },
    description: {
      en: "YouTube or Vimeo video. Other https links appear as a plain link.",
      es: "YouTube or Vimeo video. Other https links appear as a plain link.",
      pt: "YouTube or Vimeo video. Other https links appear as a plain link.",
    },
    icon: "i-lucide-video",
    category: "embed",
    keywords: ["youtube", "vimeo", "embed", "iframe", "link"],
    defaultProps: { url: "", caption: "" },
    fields: {
      url: { type: "url", label: { en: "URL", es: "URL", pt: "URL" }, required: true },
      caption: { type: "text", label: { en: "Caption", es: "Caption", pt: "Caption" } },
    },
  }),
  defineBlock({
    type: "ScriptBlock",
    label: { en: "Script", es: "Script", pt: "Script" },
    icon: "i-lucide-clapperboard",
    category: "screenplay",
    defaultProps: { title: "", synopsis: "", characters: [] },
    fields: {
      title: { type: "text", label: { en: "Title", es: "Title", pt: "Title" } },
      synopsis: { type: "textarea", label: { en: "Synopsis", es: "Synopsis", pt: "Synopsis" } },
      characters: { type: "tags", label: { en: "Characters", es: "Characters", pt: "Characters" } },
      aPlot: { type: "textarea", label: { en: "A plot", es: "A plot", pt: "A plot" } },
      bPlot: { type: "textarea", label: { en: "B plot", es: "B plot", pt: "B plot" } },
      cPlot: { type: "textarea", label: { en: "C plot", es: "C plot", pt: "C plot" } },
      stinger: { type: "textarea", label: { en: "Stinger", es: "Stinger", pt: "Stinger" } },
    },
    children: ["SceneBlock"],
  }),
  defineBlock({
    type: "SceneBlock",
    label: { en: "Scene", es: "Scene", pt: "Scene" },
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
      location: { type: "text", label: { en: "Location", es: "Location", pt: "Location" } },
      setting: {
        type: "select",
        label: { en: "Setting", es: "Setting", pt: "Setting" },
        options: ["INTERIOR", "EXTERIOR", "OTHER"].map((v) => ({ value: v, label: v })),
      },
      timeOfDay: {
        type: "select",
        label: { en: "Time of day", es: "Time of day", pt: "Time of day" },
        options: ["MORNING", "NOON", "AFTERNOON", "EVENING", "NIGHT", "OTHER"].map((v) => ({
          value: v,
          label: v,
        })),
      },
      transition: {
        type: "select",
        label: { en: "Transition", es: "Transition", pt: "Transition" },
        options: ["CUT_TO", "CUT_BACK_TO", "FADE_TO", "NONE"].map((v) => ({ value: v, label: v })),
      },
      description: {
        type: "richtext",
        label: { en: "Description", es: "Description", pt: "Description" },
      },
    },
    children: ["DialogueBlock", "ParagraphBlock", "CalloutBlock"],
  }),
  defineBlock({
    type: "DialogueBlock",
    label: { en: "Dialogue", es: "Dialogue", pt: "Dialogue" },
    icon: "i-lucide-message-square-quote",
    category: "screenplay",
    parents: ["SceneBlock"],
    // Rich text so a speaker can be a mention of their Character page, or plain text when the
    // character has no page.
    defaultProps: { character: [], parenthetical: "", line: [] },
    fields: {
      character: {
        type: "richtext",
        label: { en: "Character", es: "Character", pt: "Character" },
      },
      parenthetical: {
        type: "text",
        label: { en: "Parenthetical", es: "Parenthetical", pt: "Parenthetical" },
      },
    },
    inlineText: "line",
    richText: true,
  }),
  defineBlock({
    type: "ApiDocumentationBlock",
    label: { en: "API documentation", es: "API documentation", pt: "API documentation" },
    description: {
      en: "A component's props, slots, emits and theme, generated from its source.",
      es: "A component's props, slots, emits and theme, generated from its source.",
      pt: "A component's props, slots, emits and theme, generated from its source.",
    },
    icon: "i-lucide-book-open",
    category: "embed",
    defaultProps: {
      componentName: "",
      sections: { props: true, slots: true, emits: true, theme: true, changelog: false },
      hide: [],
      show: [],
    },
    fields: {
      componentName: {
        type: "text",
        label: { en: "Component", es: "Component", pt: "Component" },
        required: true,
      },
      sections: { type: "json", label: { en: "Sections", es: "Sections", pt: "Sections" } },
      hide: { type: "tags", label: { en: "Hide props", es: "Hide props", pt: "Hide props" } },
      show: {
        type: "tags",
        label: { en: "Only show props", es: "Only show props", pt: "Only show props" },
      },
    },
  }),
];
