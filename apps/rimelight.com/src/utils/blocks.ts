import type { BlockType } from "#types/blocks";

export interface AllowedChildren {
  types: BlockType[];
}

export interface BlockDefinition {
  type: BlockType;
  label: string;
  icon: string;
  category: string;
  description?: string;
  allowedChildren?: AllowedChildren;
  nestable?: boolean;
  draggable?: boolean;
}

export const CATEGORY_ORDER = ["Layout", "Text", "Media", "Screenwriting", "Special"];

export const BLOCK_DEFINITIONS: BlockDefinition[] = [
  {
    type: "SectionBlock",
    label: "blocks.SectionBlock.label",
    icon: "lucide:heading",
    category: "Layout",
    description: "blocks.SectionBlock.description",
    allowedChildren: {
      types: ["SectionBlock", "ParagraphBlock", "CalloutBlock", "ImageBlock", "ScriptBlock"],
    },
    nestable: true,
    draggable: true,
  },
  {
    type: "ParagraphBlock",
    label: "blocks.ParagraphBlock.label",
    icon: "lucide:pilcrow",
    category: "Text",
    description: "blocks.ParagraphBlock.description",
    allowedChildren: { types: [] },
    nestable: false,
    draggable: true,
  },
  {
    type: "ImageBlock",
    label: "blocks.ImageBlock.label",
    icon: "lucide:image",
    category: "Media",
    description: "blocks.ImageBlock.description",
    allowedChildren: { types: [] },
    nestable: false,
    draggable: true,
  },
  {
    type: "CalloutBlock",
    label: "blocks.CalloutBlock.label",
    icon: "lucide:info",
    category: "Special",
    description: "blocks.CalloutBlock.description",
    allowedChildren: { types: ["ParagraphBlock", "CalloutBlock", "ImageBlock"] },
    nestable: true,
    draggable: true,
  },
  {
    type: "ScriptBlock",
    label: "blocks.ScriptBlock.label",
    icon: "lucide:clapperboard",
    category: "Screenwriting",
    description: "blocks.ScriptBlock.description",
    allowedChildren: { types: ["SceneBlock"] },
    nestable: true,
    draggable: true,
  },
  {
    type: "SceneBlock",
    label: "blocks.SceneBlock.label",
    icon: "lucide:projector",
    category: "Screenwriting",
    description: "blocks.SceneBlock.description",
    allowedChildren: { types: ["ParagraphBlock", "CalloutBlock", "DialogueBlock"] },
    nestable: true,
    draggable: true,
  },
  {
    type: "DialogueBlock",
    label: "blocks.DialogueBlock.label",
    icon: "lucide:message-square-text",
    category: "Screenwriting",
    description: "blocks.DialogueBlock.description",
    allowedChildren: { types: [] },
    nestable: false,
    draggable: true,
  },
];
