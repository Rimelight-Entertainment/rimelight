import { createMemo, splitProps, type Component, type JSX } from "solid-js"
import type { ScrollAreaProps } from "./scroll-area"
import { scrollAreaTheme } from "./scroll-area.theme"

export interface RLSScrollAreaProps extends ScrollAreaProps {
  children?: JSX.Element
}

const RLSScrollArea: Component<RLSScrollAreaProps> = (allProps) => {
  const [props, rest] = splitProps(allProps, [
    "ui",
    "class",
    "children",
    "checked",
    "disabled",
    "name",
    "label",
    "value",
    "trailing"
  ])

  const resolvedClasses = createMemo(() =>
    scrollAreaTheme({
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

export default RLSScrollArea
