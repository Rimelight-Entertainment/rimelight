import { createMemo, splitProps, type Component, type JSX } from "solid-js"
import type { ChatMessagesProps } from "./chat-messages"
import { chatMessagesTheme } from "./chat-messages.theme"

export interface RLSChatMessagesProps extends ChatMessagesProps {
  children?: JSX.Element
}

const RLSChatMessages: Component<RLSChatMessagesProps> = (allProps) => {
  const [props, rest] = splitProps(allProps, ["ui", "class", "children"])

  const resolvedClasses = createMemo(() =>
    chatMessagesTheme({
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

export default RLSChatMessages
