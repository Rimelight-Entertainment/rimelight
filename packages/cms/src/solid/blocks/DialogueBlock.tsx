import { Show, type Component } from "solid-js";
import type { BlockViewProps } from "./ParagraphBlock";

export const DialogueBlock: Component<BlockViewProps> = (props) => {
  const character = () => (props.block.props?.["character"] as string) ?? "CHARACTER";
  const parenthetical = () => props.block.props?.["parenthetical"] as string | undefined;
  const line = () => (props.block.props?.["line"] as string) ?? "";

  return (
    <div
      class="cms-dialogue-block max-w-xl mx-auto my-3 font-mono text-sm text-center"
      data-block-id={props.block.id}
    >
      <div class="font-bold tracking-wider uppercase text-neutral-900 dark:text-neutral-100">
        {character()}
      </div>
      <Show when={parenthetical()}>
        <div class="text-xs italic text-neutral-500 dark:text-neutral-400">({parenthetical()})</div>
      </Show>
      <div class="text-left text-neutral-800 dark:text-neutral-200 mt-1 max-w-md mx-auto leading-relaxed">
        {line()}
      </div>
    </div>
  );
};
