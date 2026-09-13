import { createMemo, splitProps, type Component, type JSX } from "solid-js"
import type { ColorFieldProps } from "./color-field"
import { colorFieldTheme } from "./color-field.theme"

export interface RLSColorFieldProps extends ColorFieldProps {
  children?: JSX.Element
}

const RLSColorField: Component<RLSColorFieldProps> = (allProps) => {
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
    colorFieldTheme({
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

export default RLSColorField
