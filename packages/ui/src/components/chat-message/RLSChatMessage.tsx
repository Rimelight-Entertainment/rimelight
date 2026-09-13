import { createMemo, splitProps, type Component, type JSX } from "solid-js"
import type { ChatMessageProps } from "./chat-message"
import { chatMessageTheme } from "./chat-message.theme"

export interface RLSChatMessageProps extends ChatMessageProps {
  children?: JSX.Element
}

const RLSChatMessage: Component<RLSChatMessageProps> = (allProps) => {
  const [props, rest] = splitProps(allProps, ["ui", "class", "children"])

  const resolvedClasses = createMemo(() =>
    chatMessageTheme({
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

export default RLSChatMessage
