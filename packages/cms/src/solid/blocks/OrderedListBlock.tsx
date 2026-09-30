import { For, type Component } from "solid-js";
import type { BaseBlock } from "../../core/types/blocks.ts";
import { InlineNodes } from "./inlines.tsx";
import type { BlockViewProps } from "./ParagraphBlock.tsx";

export const OrderedListBlock: Component<BlockViewProps> = (props) => {
  const items = () => (props.block.props?.["items"] as BaseBlock[]) ?? props.block.children ?? [];

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

export default OrderedListBlock;
