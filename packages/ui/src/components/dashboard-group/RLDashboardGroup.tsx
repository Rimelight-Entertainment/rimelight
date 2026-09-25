import { createMemo, omit, type Component } from "solid-js"
import type { JSX } from "@solidjs/web"
import { Dynamic } from "@solidjs/web"
import type { DashboardGroupProps } from "./dashboard-group"
import { dashboardGroupTheme } from "./dashboard-group.theme"

export interface RLDashboardGroupProps extends DashboardGroupProps {
  children?: JSX.Element
}

const RLDashboardGroup: Component<RLDashboardGroupProps> = (allProps) => {
  const props = allProps
  const rest = omit(allProps, "as", "ui", "class", "children")

  const Tag = () => props.as || "div"

  const resolvedClasses = createMemo(() =>
    dashboardGroupTheme({
      ui: props.ui,
      class: props.class
    })
  )

  return (
    <Dynamic component={Tag()} class={resolvedClasses().root} data-slot="root" {...rest}>
      {props.children}
    </Dynamic>
  )
}

export { RLDashboardGroup }
export default RLDashboardGroup
