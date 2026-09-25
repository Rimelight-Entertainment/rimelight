import { createMemo, splitProps, type Component, type JSX } from "solid-js"
import type { ChatPaletteProps } from "./chat-palette"
import { chatPaletteTheme } from "./chat-palette.theme"

export interface RLChatPaletteProps extends ChatPaletteProps {
  children?: JSX.Element
}

const RLChatPalette: Component<RLChatPaletteProps> = (allProps) => {
  const [props, rest] = splitProps(allProps, ["ui", "class", "children"])

  const resolvedClasses = createMemo(() =>
    chatPaletteTheme({
      ui: props.ui,
      class: props.class,
      ...allProps
    })
  )

  return (
    <div class={resolvedClasses().root} data-slot="root" {...rest}>
      {props.children}
    </div>
  )
}

export { RLChatPalette }
export default RLChatPalette
