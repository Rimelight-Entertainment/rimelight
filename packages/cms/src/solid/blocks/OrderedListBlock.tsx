import { For, type Component } from "solid-js";
import type { BaseBlock } from "../../core/types/blocks";
import { InlineNodes } from "./inlines";
import type { BlockViewProps } from "./ParagraphBlock";

export const OrderedListBlock: Component<BlockViewProps> = (props) => {
  const items = () => props.block.children ?? [];

  return (
    <ol
      class="cms-ordered-list list-decimal list-inside space-y-2 my-4 text-base text-neutral-800"
      data-block-id={props.block.id}
    >
      <For each={items()}>
        {(item) => (
          <li>
            <InlineNodes nodes={(item.props?.["content"] as any) ?? []} />
          </li>
        )}
      </For>
    </ol>
  );
};
