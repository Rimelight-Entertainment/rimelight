import { For, type Component } from "solid-js";
import { RichText } from "./inlines";
import type { BlockViewProps } from "./ParagraphBlock";

export const UnorderedListBlock: Component<BlockViewProps> = (props) => {
  const items = () => props.block.children ?? [];

  return (
    <ul
      class="cms-unordered-list list-disc list-inside space-y-2 my-4 text-base text-neutral-800"
      data-block-id={props.block.id}
    >
      <For each={items()}>
        {(item) => (
          <li>
            <RichText value={item.props?.["content"]} locale={props.locale} />
          </li>
        )}
      </For>
    </ul>
  );
};
