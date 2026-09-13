import { createMemo, splitProps, type Component, type JSX } from "solid-js"
import type { DashboardSidebarCollapseProps } from "./dashboard-sidebar-collapse"
import { dashboardSidebarCollapseTheme } from "./dashboard-sidebar-collapse.theme"
import RLSIcon from "../icon/RLSIcon"

export interface RLSDashboardSidebarCollapseProps extends DashboardSidebarCollapseProps {
  children?: JSX.Element
}

const RLSDashboardSidebarCollapse: Component<RLSDashboardSidebarCollapseProps> = (allProps) => {
  const [props, rest] = splitProps(allProps, ["icon", "ui", "class", "children"])

  const resolvedClasses = createMemo(() =>
    dashboardSidebarCollapseTheme({
      ui: props.ui,
      class: props.class
    })
  )

  return (
    <button
      type="button"
      data-dashboard-toggle="collapse"
      class={resolvedClasses().root}
      data-slot="root"
      aria-label="Collapse sidebar"
      {...rest}
    >
      <RLSIcon
        name={props.icon || "i-lucide-panel-left"}
        class="size-5"
        data-dashboard-collapse-icon
        data-expanded
      />
      <RLSIcon
        name="i-lucide-panel-right"
        class="size-5 hidden"
        data-dashboard-collapse-icon
        data-collapsed
      />
      {props.children}
    </button>
  )
}

export default RLSDashboardSidebarCollapse
