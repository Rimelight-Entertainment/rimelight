import { createMemo, splitProps, type Component, type JSX } from "solid-js"
import type { DashboardNavbarProps } from "./dashboard-navbar"
import { dashboardNavbarTheme } from "./dashboard-navbar.theme"

export interface RLSDashboardNavbarProps extends DashboardNavbarProps {
  children?: JSX.Element
}

const RLSDashboardNavbar: Component<RLSDashboardNavbarProps> = (allProps) => {
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
    dashboardNavbarTheme({
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

export default RLSDashboardNavbar
