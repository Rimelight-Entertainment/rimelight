import { createMemo, splitProps, type Component, type JSX } from "solid-js"
import type { RadioGroupProps } from "./radio-group"
import { radioGroupTheme } from "./radio-group.theme"

export interface RLRadioGroupProps extends RadioGroupProps {
  children?: JSX.Element
}

const RLRadioGroup: Component<RLRadioGroupProps> = (allProps) => {
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
    radioGroupTheme({
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

export { RLRadioGroup }
export default RLRadioGroup
