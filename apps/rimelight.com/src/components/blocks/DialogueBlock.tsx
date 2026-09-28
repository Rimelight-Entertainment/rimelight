import type { Component } from "solid-js"
import type { BaseBlock } from "@rimelight/cms"

export interface DialogueBlockProps {
  block: BaseBlock
  locale?: string
}

export const DialogueBlock: Component<DialogueBlockProps> = (props) => {
  const p = () => (props.block.props || {}) as any
  const character = () => p().character
  const parenthetical = () => p().parenthetical
  const line = () => p().line

  return (
    <div class="my-3 mx-8 max-w-md">
      <div class="text-sm font-bold text-center text-amber-800">{character()}</div>
      {parenthetical() && (
        <div class="text-xs italic text-center text-neutral-600 mt-0.5">({parenthetical()})</div>
      )}
      <div class="text-sm text-center text-neutral-700 mt-1">{line()}</div>
    </div>
  )
}

export default DialogueBlock
