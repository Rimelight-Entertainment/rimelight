import { createMemo, splitProps, type Component, type JSX } from "solid-js"
import type { ChatPromptProps } from "./chat-prompt"
import { chatPromptTheme } from "./chat-prompt.theme"

export interface RLChatPromptProps extends ChatPromptProps {
  children?: JSX.Element
}

const RLChatPrompt: Component<RLChatPromptProps> = (allProps) => {
  const [props, rest] = splitProps(allProps, ["ui", "class", "children"])

  const resolvedClasses = createMemo(() =>
    chatPromptTheme({
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

export { RLChatPrompt }
export default RLChatPrompt
