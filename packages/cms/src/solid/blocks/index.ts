import { ParagraphBlock } from "./ParagraphBlock";
import { SectionBlock } from "./SectionBlock";
import { CalloutBlock } from "./CalloutBlock";
import { ImageBlock } from "./ImageBlock";
import { CodeBlock } from "./CodeBlock";
import { TableBlock } from "./TableBlock";
import { TabsBlock } from "./TabsBlock";
import { TabItemBlock } from "./TabItemBlock";
import { StepsBlock } from "./StepsBlock";
import { StepItemBlock } from "./StepItemBlock";
import { CardsBlock } from "./CardsBlock";
import { CardBlock } from "./CardBlock";
import { FileTreeBlock } from "./FileTreeBlock";
import { UnorderedListBlock } from "./UnorderedListBlock";
import { OrderedListBlock } from "./OrderedListBlock";
import { LivePreviewBlock } from "./LivePreviewBlock";
import { DividerBlock } from "./DividerBlock";
import { QuoteBlock } from "./QuoteBlock";
import { EmbedBlock } from "./EmbedBlock";
import type { Component } from "solid-js";
import { builtinBlocks } from "../../core/blocks/builtins";
import { BlockRegistry, type BlockDefinition } from "../../core/blocks/registry";
import type { BlockViewProps } from "./ParagraphBlock";

export {
  ParagraphBlock,
  SectionBlock,
  CalloutBlock,
  ImageBlock,
  CodeBlock,
  TableBlock,
  TabsBlock,
  TabItemBlock,
  StepsBlock,
  StepItemBlock,
  CardsBlock,
  CardBlock,
  FileTreeBlock,
  UnorderedListBlock,
  OrderedListBlock,
  LivePreviewBlock,
  DividerBlock,
  QuoteBlock,
  EmbedBlock,
};
export type { BlockViewProps };
export {
  InlineNodes,
  InlineNodeView,
  MentionView,
  RichText,
  RichTextContext,
  RichTextProvider,
  useRichText,
  useMentionInfo,
  type RichTextConfig,
  type RichTextCollection,
} from "./inlines";

export const defaultBlockComponents: Record<string, Component<BlockViewProps>> = {
  ParagraphBlock,
  SectionBlock,
  CalloutBlock,
  ImageBlock,
  CodeBlock,
  TableBlock,
  TabsBlock,
  TabItemBlock,
  StepsBlock,
  StepItemBlock,
  CardsBlock,
  CardBlock,
  FileTreeBlock,
  UnorderedListBlock,
  OrderedListBlock,
  LivePreviewBlock,
  DividerBlock,
  QuoteBlock,
  EmbedBlock,
};

/** Built-in block definitions with their Solid renderers attached. */
export const defaultBlocks: BlockDefinition<any>[] = builtinBlocks.map((def) => {
  const render = defaultBlockComponents[def.type];
  return render ? { ...def, render: render as any } : def;
});

/**
 * A registry with the built-in blocks plus `extra` (custom blocks from `cms.config.ts`).
 * Custom definitions override built-ins with the same `type`.
 */
export function createBlockRegistry(extra: BlockDefinition<any>[] = []): BlockRegistry {
  return new BlockRegistry().register(...defaultBlocks, ...extra);
}
