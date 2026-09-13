import { createMemo, splitProps, type Component, type JSX } from "solid-js"
import type { SliderProps } from "./slider"
import { sliderTheme } from "./slider.theme"

export interface RLSSliderProps extends SliderProps {
  children?: JSX.Element
}

const RLSSlider: Component<RLSSliderProps> = (allProps) => {
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
    sliderTheme({
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

export default RLSSlider
