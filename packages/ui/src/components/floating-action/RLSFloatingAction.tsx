import { createMemo, splitProps, type Component, type JSX } from "solid-js"
import type { FloatingActionProps } from "./floating-action"
import { floatingActionTheme } from "./floating-action.theme"

export interface RLSFloatingActionProps extends FloatingActionProps {
  children?: JSX.Element
}

const RLSFloatingAction: Component<RLSFloatingActionProps> = (allProps) => {
  const [props, rest] = splitProps(allProps, ["ui", "class", "children"])

  const resolvedClasses = createMemo(() =>
    floatingActionTheme({
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

export default RLSFloatingAction
