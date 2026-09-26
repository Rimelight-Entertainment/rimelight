import { createMemo, omit, type Component } from "solid-js"
import type { JSX } from "@solidjs/web"
import type { ChatReasoningProps } from "./chat-reasoning"
import { chatReasoningTheme } from "./chat-reasoning.theme"

export interface RLChatReasoningProps extends ChatReasoningProps {
  children?: JSX.Element
}

const RLChatReasoning: Component<RLChatReasoningProps> = (allProps) => {
  const props = allProps
  const rest = omit(allProps, "ui", "class", "children")

  const resolvedClasses = createMemo(() =>
    chatReasoningTheme({
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

export { RLChatReasoning }
export default RLChatReasoning
