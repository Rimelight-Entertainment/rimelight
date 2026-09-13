import { createMemo, splitProps, type Component, type JSX } from "solid-js"
import { Dynamic } from "solid-js/web"
import type { DashboardResizeHandleProps } from "./dashboard-resize-handle"
import { dashboardResizeHandleTheme } from "./dashboard-resize-handle.theme"

export interface RLSDashboardResizeHandleProps extends DashboardResizeHandleProps {
  children?: JSX.Element
}

const RLSDashboardResizeHandle: Component<RLSDashboardResizeHandleProps> = (allProps) => {
  const [props, rest] = splitProps(allProps, ["as", "ui", "class", "children"])

  const Tag = () => props.as || "div"

  const resolvedClasses = createMemo(() =>
    dashboardResizeHandleTheme({
      ui: props.ui,
      class: props.class
    })
  )

  return (
    <Dynamic
      component={Tag()}
      data-slot="root"
      class={resolvedClasses().root}
      role="separator"
      {...rest}
    >
      {props.children}
    </Dynamic>
  )
}

export default RLSDashboardResizeHandle
