import type { Component } from "solid-js";
import { RichText } from "./inlines";
import type { BlockViewProps } from "./ParagraphBlock";

export const ToggleBlock: Component<BlockViewProps> = (props) => {
  const open = () => props.block.props?.["open"] === true;

  return (
    <details class="cms-toggle my-3" open={open()} data-block-id={props.block.id}>
      <summary class="cursor-pointer list-none flex items-center gap-2 font-semibold text-neutral-900">
        <span class="i-lucide-chevron-right size-4 shrink-0" aria-hidden="true" />
        <RichText value={props.block.props?.["summary"]} locale={props.locale} />
      </summary>
      <div class="pl-6 mt-2">{props.children}</div>
    </details>
  );
};
