import { createMemo, splitProps, type Component, type JSX } from "solid-js"
import type { DashboardSearchProps } from "./dashboard-search"
import { dashboardSearchTheme } from "./dashboard-search.theme"

export interface RLSDashboardSearchProps extends DashboardSearchProps {
  children?: JSX.Element
}

const RLSDashboardSearch: Component<RLSDashboardSearchProps> = (allProps) => {
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
    dashboardSearchTheme({
      ui: props.ui,
      class: props.class,
      ...allProps
    })
  )

  return (
    <div class={resolvedClasses().modal} data-slot="modal" {...rest}>
      <input class={resolvedClasses().input} data-slot="input" placeholder="Search..." />
      {props.children}
    </div>
  )
}

export default RLSDashboardSearch
