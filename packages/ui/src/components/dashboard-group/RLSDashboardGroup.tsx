import { createMemo, splitProps, type Component, type JSX } from "solid-js"
import type { DashboardGroupProps } from "./dashboard-group"
import { dashboardGroupTheme } from "./dashboard-group.theme"

export interface RLSDashboardGroupProps extends DashboardGroupProps {
  children?: JSX.Element
}

const RLSDashboardGroup: Component<RLSDashboardGroupProps> = (allProps) => {
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
    dashboardGroupTheme({
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

export default RLSDashboardGroup
