import { createMemo, splitProps, type Component, type JSX } from "solid-js"
import type { DashboardSidebarCollapseProps } from "./dashboard-sidebar-collapse"
import { dashboardSidebarCollapseTheme } from "./dashboard-sidebar-collapse.theme"

export interface RLSDashboardSidebarCollapseProps extends DashboardSidebarCollapseProps {
  children?: JSX.Element
}

const RLSDashboardSidebarCollapse: Component<RLSDashboardSidebarCollapseProps> = (allProps) => {
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
    dashboardSidebarCollapseTheme({
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

export default RLSDashboardSidebarCollapse
