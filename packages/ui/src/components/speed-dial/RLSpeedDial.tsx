import { createMemo, omit, type Component } from "solid-js"
import type { JSX } from "@solidjs/web"
import type { SpeedDialProps } from "./speed-dial"
import { speedDialTheme } from "./speed-dial.theme"

export interface RLSpeedDialProps extends SpeedDialProps {
  children?: JSX.Element
}

const RLSpeedDial: Component<RLSpeedDialProps> = (allProps) => {
  const props = allProps
  const rest = omit(allProps, "ui", "class", "children")

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

export { RLSpeedDial }
export default RLSpeedDial
