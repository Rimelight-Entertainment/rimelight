import { createMemo, splitProps, type Component, type JSX } from "solid-js"
import type { ChatShimmerProps } from "./chat-shimmer"
import { chatShimmerTheme } from "./chat-shimmer.theme"

export interface RLSChatShimmerProps extends ChatShimmerProps {
  children?: JSX.Element
}

const RLSChatShimmer: Component<RLSChatShimmerProps> = (allProps) => {
  const [props, rest] = splitProps(allProps, ["ui", "class", "children"])

  const resolvedClasses = createMemo(() =>
    chatShimmerTheme({
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

export default RLSChatShimmer
