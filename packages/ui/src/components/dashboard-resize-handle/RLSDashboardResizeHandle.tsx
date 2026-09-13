import { createMemo, splitProps, type Component, type JSX } from "solid-js"
import type { DashboardResizeHandleProps } from "./dashboard-resize-handle"
import { dashboardResizeHandleTheme } from "./dashboard-resize-handle.theme"

export interface RLSDashboardResizeHandleProps extends DashboardResizeHandleProps {
  children?: JSX.Element
}

const RLSDashboardResizeHandle: Component<RLSDashboardResizeHandleProps> = (allProps) => {
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
    dashboardResizeHandleTheme({
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

export default RLSDashboardResizeHandle
