import type { Component } from "solid-js";
import type { JSX } from "@solidjs/web";
import type { BaseBlock } from "../../core/types/blocks";
import type { InlineNode } from "../../core/types/inline";
import { InlineNodes } from "./inlines";

export interface BlockViewProps {
  block: BaseBlock;
  locale?: string | undefined;
  sectionDepth?: number | undefined;
  index?: number | undefined;
  components?: Record<string, Component<any>> | undefined;
  children?: JSX.Element | undefined;
}

export const ParagraphBlock: Component<BlockViewProps> = (props) => (
  <p
    class="cms-paragraph text-base leading-relaxed text-neutral-800 my-4 whitespace-pre-wrap break-words"
    data-block-id={props.block.id}
  >
    <InlineNodes nodes={(props.block.props?.["text"] as InlineNode[]) ?? []} />
  </p>
);
