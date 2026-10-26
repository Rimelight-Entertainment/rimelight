import type { Component } from "solid-js";
import type { BlockViewProps } from "./ParagraphBlock";

export const DividerBlock: Component<BlockViewProps> = (props) => (
  <hr class="cms-divider my-8 border-neutral-200" data-block-id={props.block.id} />
);
