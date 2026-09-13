import { createMemo, splitProps, type Component, type JSX } from "solid-js"
import type { DashboardSidebarProps } from "./dashboard-sidebar"
import { dashboardSidebarTheme } from "./dashboard-sidebar.theme"

export interface RLSDashboardSidebarProps extends DashboardSidebarProps {
  children?: JSX.Element
}

const RLSDashboardSidebar: Component<RLSDashboardSidebarProps> = (allProps) => {
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
    dashboardSidebarTheme({
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

export default RLSDashboardSidebar
