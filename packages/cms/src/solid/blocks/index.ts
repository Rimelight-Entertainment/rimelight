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
import { ScriptBlock } from "./ScriptBlock";
import { SceneBlock } from "./SceneBlock";
import { DialogueBlock } from "./DialogueBlock";
import { LivePreviewBlock } from "./LivePreviewBlock";
import type { Component } from "solid-js";
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
  ScriptBlock,
  SceneBlock,
  DialogueBlock,
  LivePreviewBlock,
};
export type { BlockViewProps };
export { InlineNodes, InlineNodeView, resolveInlineText } from "./inlines";

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
  ScriptBlock,
  SceneBlock,
  DialogueBlock,
  LivePreviewBlock,
};
