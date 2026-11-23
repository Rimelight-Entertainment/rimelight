import type { Component } from "solid-js";
import type { BaseBlock } from "../../core/types/blocks";
import { RichText } from "./inlines";

export interface DialogueBlockProps {
  block: BaseBlock;
  locale?: string | undefined;
}

export const DialogueBlock: Component<DialogueBlockProps> = (props) => {
  const p = () => (props.block.props || {}) as any;
  const character = () => p().character;
  const parenthetical = () => p().parenthetical;
  const line = () => p().line;

  return (
    <div class="my-3 mx-8 max-w-md">
      <div class="text-sm font-bold text-center text-amber-800">
        <RichText value={character()} locale={props.locale} />
      </div>
      {parenthetical() && (
        <div class="text-xs italic text-center text-neutral-600 mt-0.5">({parenthetical()})</div>
      )}
      <div class="text-sm text-center text-neutral-700 mt-1">
        <RichText value={line()} locale={props.locale} />
      </div>
    </div>
  );
};

export default DialogueBlock;
