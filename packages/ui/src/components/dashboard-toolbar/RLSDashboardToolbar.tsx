import { createMemo, splitProps, type Component, type JSX } from "solid-js"
import { Dynamic } from "solid-js/web"
import type { DashboardToolbarProps } from "./dashboard-toolbar"
import { dashboardToolbarTheme } from "./dashboard-toolbar.theme"

export interface RLSDashboardToolbarProps extends DashboardToolbarProps {
  children?: JSX.Element
  leftSlot?: JSX.Element
  rightSlot?: JSX.Element
}

const RLSDashboardToolbar: Component<RLSDashboardToolbarProps> = (allProps) => {
  const [props, rest] = splitProps(allProps, [
    "as",
    "ui",
    "class",
    "children",
    "leftSlot",
    "rightSlot"
  ])

  const Tag = () => props.as || "div"

  const resolvedClasses = createMemo(() =>
    dashboardToolbarTheme({
      ui: props.ui,
      class: props.class
    })
  )

  return (
    <Dynamic component={Tag()} class={resolvedClasses().root} data-slot="root" {...rest}>
      {props.children !== undefined ? (
        props.children
      ) : (
        <>
          <div data-slot="left" class={resolvedClasses().left}>
            {props.leftSlot}
          </div>
          <div data-slot="right" class={resolvedClasses().right}>
            {props.rightSlot}
          </div>
        </>
      )}
    </Dynamic>
  )
}

export default RLSDashboardToolbar
