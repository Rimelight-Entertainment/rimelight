import type { Component } from "solid-js";
import { RichText } from "./inlines";
import type { BlockViewProps } from "./ParagraphBlock";

export const TodoBlock: Component<BlockViewProps> = (props) => {
  const checked = () => props.block.props?.["checked"] === true;

  return (
    <div
      class="cms-todo flex items-start gap-2 my-2 text-base text-neutral-800"
      data-block-id={props.block.id}
    >
      <input type="checkbox" class="mt-1.5 size-4 shrink-0" checked={checked()} disabled />
      <div
        class={`flex-1 min-w-0 whitespace-pre-wrap break-words ${checked() ? "line-through text-neutral-500" : ""}`}
      >
        <RichText value={props.block.props?.["text"]} locale={props.locale} />
      </div>
    </div>
  );
};
