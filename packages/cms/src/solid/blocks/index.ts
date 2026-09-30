import { ParagraphBlock } from "./ParagraphBlock.tsx";
import { SectionBlock } from "./SectionBlock.tsx";
import { CalloutBlock } from "./CalloutBlock.tsx";
import { ImageBlock } from "./ImageBlock.tsx";
import { CodeBlock } from "./CodeBlock.tsx";
import { TableBlock } from "./TableBlock.tsx";
import { TabsBlock } from "./TabsBlock.tsx";
import { TabItemBlock } from "./TabItemBlock.tsx";
import { StepsBlock } from "./StepsBlock.tsx";
import { StepItemBlock } from "./StepItemBlock.tsx";
import { CardsBlock } from "./CardsBlock.tsx";
import { CardBlock } from "./CardBlock.tsx";
import { FileTreeBlock } from "./FileTreeBlock.tsx";
import { UnorderedListBlock } from "./UnorderedListBlock.tsx";
import { OrderedListBlock } from "./OrderedListBlock.tsx";
import { ScriptBlock } from "./ScriptBlock.tsx";
import { SceneBlock } from "./SceneBlock.tsx";
import { DialogueBlock } from "./DialogueBlock.tsx";
import { LivePreviewBlock } from "./LivePreviewBlock.tsx";
import type { Component } from "solid-js";
import type { BlockViewProps } from "./ParagraphBlock.tsx";

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
  LivePreviewBlock
};
export type { BlockViewProps };
export { InlineNodes, InlineNodeView, resolveInlineText } from "./inlines.tsx";

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
  LivePreviewBlock
};

export default defaultBlockComponents;
