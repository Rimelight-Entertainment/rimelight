import { createMemo, splitProps, type Component, type JSX } from "solid-js"
import { Dynamic } from "solid-js/web"
import type { DashboardGroupProps } from "./dashboard-group"
import { dashboardGroupTheme } from "./dashboard-group.theme"

export interface RLSDashboardGroupProps extends DashboardGroupProps {
  children?: JSX.Element
}

const RLSDashboardGroup: Component<RLSDashboardGroupProps> = (allProps) => {
  const [props, rest] = splitProps(allProps, ["as", "ui", "class", "children"])

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

export default RLSDashboardGroup
