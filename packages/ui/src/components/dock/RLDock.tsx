import { createMemo, splitProps, type Component, type JSX } from "solid-js"
import type { DockProps } from "./dock"
import { dockTheme } from "./dock.theme"

export interface RLDockProps extends DockProps {
  children?: JSX.Element
}

const RLDock: Component<RLDockProps> = (allProps) => {
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

export { RLDock }
export default RLDock
