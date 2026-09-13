import { createMemo, splitProps, type Component, type JSX } from "solid-js"
import type { SpeedDialProps } from "./speed-dial"
import { speedDialTheme } from "./speed-dial.theme"

export interface RLSSpeedDialProps extends SpeedDialProps {
  children?: JSX.Element
}

const RLSSpeedDial: Component<RLSSpeedDialProps> = (allProps) => {
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
    speedDialTheme({
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

export default RLSSpeedDial
