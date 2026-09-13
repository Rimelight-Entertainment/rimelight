import { createMemo, splitProps, type Component, type JSX } from "solid-js"
import type { DashboardSearchButtonProps } from "./dashboard-search-button"
import { dashboardSearchButtonTheme } from "./dashboard-search-button.theme"

export interface RLSDashboardSearchButtonProps extends DashboardSearchButtonProps {
  children?: JSX.Element
}

const RLSDashboardSearchButton: Component<RLSDashboardSearchButtonProps> = (allProps) => {
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
    dashboardSearchButtonTheme({
      ui: props.ui,
      class: props.class,
      ...allProps
    })
  )

  return (
    <button type="button" class={resolvedClasses().base} data-slot="base" {...rest}>
      <span class={resolvedClasses().label} data-slot="label">
        {props.label || "Search..."}
      </span>
      <span class={resolvedClasses().trailing} data-slot="trailing">
        {props.trailing as JSX.Element}
      </span>
      {props.children}
    </button>
  )
}

export default RLSDashboardSearchButton
