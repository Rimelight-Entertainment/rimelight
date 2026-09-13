import { createMemo, splitProps, type Component, type JSX } from "solid-js"
import type { KnobProps } from "./knob"
import { knobTheme } from "./knob.theme"

export interface RLSKnobProps extends KnobProps {
  children?: JSX.Element
}

const RLSKnob: Component<RLSKnobProps> = (allProps) => {
  const [props, rest] = splitProps(allProps, ["ui", "class", "children"])

  const resolvedClasses = createMemo(() =>
    knobTheme({
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

export default RLSKnob
