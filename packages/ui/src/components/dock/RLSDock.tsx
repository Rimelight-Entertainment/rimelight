import { createMemo, splitProps, type Component, type JSX } from "solid-js"
import type { DockProps } from "./dock"
import { dockTheme } from "./dock.theme"

export interface RLSDockProps extends DockProps {
  children?: JSX.Element
}

const RLSDock: Component<RLSDockProps> = (allProps) => {
  const [props, rest] = splitProps(allProps, ["ui", "class", "children"])

  const resolvedClasses = createMemo(() =>
    dockTheme({
      ui: props.ui,
      class: props.class
    })
  )

  return (
    <div class={resolvedClasses().root} data-slot="root" {...rest}>
      {props.children}
    </div>
  )
}

export default RLSDock
