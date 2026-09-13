import { createMemo, splitProps, type Component, type JSX } from "solid-js"
import type { SlideoverProps } from "./slideover"
import { slideoverTheme } from "./slideover.theme"

export interface RLSSlideoverProps extends SlideoverProps {
  children?: JSX.Element
}

const RLSSlideover: Component<RLSSlideoverProps> = (allProps) => {
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
    slideoverTheme({
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

export default RLSSlideover
