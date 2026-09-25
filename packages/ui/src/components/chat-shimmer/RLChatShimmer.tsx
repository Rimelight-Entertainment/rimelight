import { createMemo, splitProps, type Component, type JSX } from "solid-js"
import type { ChatShimmerProps } from "./chat-shimmer"
import { chatShimmerTheme } from "./chat-shimmer.theme"

export interface RLChatShimmerProps extends ChatShimmerProps {
  children?: JSX.Element
}

const RLChatShimmer: Component<RLChatShimmerProps> = (allProps) => {
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

export { RLChatShimmer }
export default RLChatShimmer
