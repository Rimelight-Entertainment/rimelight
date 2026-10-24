import { z } from "zod";
import type { Component } from "solid-js";
import type { BaseBlock } from "./types/blocks";

export interface BlockRenderProps<_TProps = any> {
  block: BaseBlock;
  locale?: string;
  sectionDepth?: number;
  index?: number;
  components?: Record<string, Component<any>>;
  children?: any;
}

export interface BlockEditorProps<TProps = any> {
  props: TProps;
  onPropsChange: (props: TProps) => void;
  blockId?: string;
  sectionDepth?: number;
  children?: () => BaseBlock[];
  onRelocate?: (id: string, newIndex: number, targetParentId?: string | null) => void;
  onOpenPicker?: () => void;
  renderChildBlock?: (child: BaseBlock, depth: number) => any;
}

export interface BlockDefinition<TSchema extends z.ZodTypeAny = z.ZodTypeAny> {
  type: string;
  label: string;
  description?: string;
  icon?: string;
  category?: string;
  schema?: TSchema;
  defaultProps: Record<string, any>;
  allowChildren?: boolean;
  allowedChildren?: string[];
  render?: Component<BlockRenderProps<z.infer<TSchema>>>;
  editor?: Component<BlockEditorProps<z.infer<TSchema>>> | "auto";
}

const definitions = new Map<string, BlockDefinition>();

export const BlockRegistry = {
  register<T extends z.ZodTypeAny>(def: BlockDefinition<T>): void {
    definitions.set(def.type, def as any);
  },

  get(type: string): BlockDefinition | undefined {
    return definitions.get(type);
  },

  getAll(): BlockDefinition[] {
    return Array.from(definitions.values());
  },

  has(type: string): boolean {
    return definitions.has(type);
  },

  clear(): void {
    definitions.clear();
  },
};

/**
 * Convenience helper to define and register a block definition.
 */
export function defineBlock<T extends z.ZodTypeAny>(def: BlockDefinition<T>): BlockDefinition<T> {
  BlockRegistry.register(def);
  return def;
}

// Register built-in block types with schemas
BlockRegistry.register({
  type: "SectionBlock",
  label: "Section",
  description: "Container block for grouping nested content",
  category: "Structure",
  icon: "heading",
  schema: z.object({
    title: z.string().default(""),
    level: z.number().min(2).max(6).default(2),
  }),
  defaultProps: { title: "", level: 2 },
  allowChildren: true,
});

BlockRegistry.register({
  type: "ParagraphBlock",
  label: "Paragraph",
  description: "Rich text paragraph block",
  category: "Text",
  icon: "paragraph",
  schema: z.object({
    text: z.any().default({ en: "" }),
  }),
  defaultProps: { text: { en: "" } },
});

BlockRegistry.register({
  type: "CalloutBlock",
  label: "Callout",
  description: "Highlighted callout box (info, warning, note)",
  category: "Callout",
  icon: "info",
  schema: z.object({
    variant: z.enum(["info", "warning", "note", "success", "tip"]).default("info"),
    text: z.any().default({ en: "" }),
  }),
  defaultProps: { variant: "info", text: { en: "" } },
  allowChildren: true,
});

BlockRegistry.register({
  type: "ImageBlock",
  label: "Image",
  description: "Image component with caption and alt text",
  category: "Media",
  icon: "image",
  schema: z.object({
    url: z.string().default(""),
    alt: z.string().default(""),
    caption: z.string().default(""),
  }),
  defaultProps: { url: "", alt: "", caption: "" },
});

BlockRegistry.register({
  type: "CodeBlock",
  label: "Code",
  description: "Code block with syntax highlighting",
  category: "Media",
  icon: "code",
  schema: z.object({
    code: z.string().default(""),
    language: z.string().default("typescript"),
  }),
  defaultProps: { code: "", language: "typescript" },
});

BlockRegistry.register({
  type: "TableBlock",
  label: "Table",
  description: "Structured data table",
  category: "Data",
  icon: "table",
  schema: z.object({
    headers: z.array(z.string()).default([]),
    rows: z.array(z.array(z.string())).default([]),
  }),
  defaultProps: { headers: [], rows: [] },
});

BlockRegistry.register({
  type: "TabsBlock",
  label: "Tabs",
  description: "Tabbed content container",
  category: "Structure",
  icon: "layers",
  schema: z.object({}),
  defaultProps: {},
  allowChildren: true,
  allowedChildren: ["TabItemBlock"],
});

BlockRegistry.register({
  type: "TabItemBlock",
  label: "Tab Item",
  description: "Individual tab page",
  category: "Structure",
  icon: "fileText",
  schema: z.object({
    title: z.string().default("Tab"),
  }),
  defaultProps: { title: "Tab" },
  allowChildren: true,
});

BlockRegistry.register({
  type: "StepsBlock",
  label: "Steps",
  description: "Step-by-step walkthrough sequence",
  category: "Structure",
  icon: "listOrdered",
  schema: z.object({}),
  defaultProps: {},
  allowChildren: true,
  allowedChildren: ["StepItemBlock"],
});

BlockRegistry.register({
  type: "StepItemBlock",
  label: "Step Item",
  description: "Individual step in sequence",
  category: "Structure",
  icon: "checkCircle",
  schema: z.object({
    title: z.string().default(""),
  }),
  defaultProps: { title: "" },
  allowChildren: true,
});

BlockRegistry.register({
  type: "CardsBlock",
  label: "Cards",
  description: "Grid of cards",
  category: "Structure",
  icon: "grid",
  schema: z.object({}),
  defaultProps: {},
  allowChildren: true,
  allowedChildren: ["CardBlock"],
});

BlockRegistry.register({
  type: "CardBlock",
  label: "Card",
  description: "Card container",
  category: "Structure",
  icon: "creditCard",
  schema: z.object({
    title: z.string().default(""),
    href: z.string().optional(),
  }),
  defaultProps: { title: "" },
  allowChildren: true,
});

BlockRegistry.register({
  type: "FileTreeBlock",
  label: "File Tree",
  description: "Visual directory file tree",
  category: "Media",
  icon: "folderTree",
  schema: z.object({
    tree: z.any().default([]),
  }),
  defaultProps: { tree: [] },
});
