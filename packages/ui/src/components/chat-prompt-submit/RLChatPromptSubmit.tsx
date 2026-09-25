import { createMemo, splitProps, type Component, type JSX } from "solid-js"
import type { ChatPromptSubmitProps } from "./chat-prompt-submit"
import { chatPromptSubmitTheme } from "./chat-prompt-submit.theme"

export interface RLChatPromptSubmitProps extends ChatPromptSubmitProps {
  children?: JSX.Element
}

const RLChatPromptSubmit: Component<RLChatPromptSubmitProps> = (allProps) => {
  const [props, rest] = splitProps(allProps, ["ui", "class", "children"])

  const resolvedClasses = createMemo(() =>
    chatPromptSubmitTheme({
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

export { RLChatPromptSubmit }
export default RLChatPromptSubmit
