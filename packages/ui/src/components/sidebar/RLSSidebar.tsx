import { createMemo, splitProps, type Component, type JSX } from "solid-js"
import type { SidebarProps } from "./sidebar"
import { sidebarTheme } from "./sidebar.theme"

export interface RLSSidebarProps extends SidebarProps {
  children?: JSX.Element
}

const RLSSidebar: Component<RLSSidebarProps> = (allProps) => {
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
    sidebarTheme({
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

export default RLSSidebar
