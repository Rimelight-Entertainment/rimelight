import { createMemo, splitProps, type Component, type JSX } from "solid-js"
import type { ColorSliderProps } from "./color-slider"
import { colorSliderTheme } from "./color-slider.theme"

export interface RLSColorSliderProps extends ColorSliderProps {
  children?: JSX.Element
}

const RLSColorSlider: Component<RLSColorSliderProps> = (allProps) => {
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
    colorSliderTheme({
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

export default RLSColorSlider
