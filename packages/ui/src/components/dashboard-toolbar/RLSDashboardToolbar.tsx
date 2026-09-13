import { createMemo, splitProps, type Component, type JSX } from "solid-js"
import type { DashboardToolbarProps } from "./dashboard-toolbar"
import { dashboardToolbarTheme } from "./dashboard-toolbar.theme"

export interface RLSDashboardToolbarProps extends DashboardToolbarProps {
  children?: JSX.Element
}

const RLSDashboardToolbar: Component<RLSDashboardToolbarProps> = (allProps) => {
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
    dashboardToolbarTheme({
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

export default RLSDashboardToolbar
