import { createMemo, splitProps, type Component, type JSX } from "solid-js"
import type { DashboardPanelProps } from "./dashboard-panel"
import { dashboardPanelTheme } from "./dashboard-panel.theme"

export interface RLSDashboardPanelProps extends DashboardPanelProps {
  children?: JSX.Element
}

const RLSDashboardPanel: Component<RLSDashboardPanelProps> = (allProps) => {
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
    dashboardPanelTheme({
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

export default RLSDashboardPanel
