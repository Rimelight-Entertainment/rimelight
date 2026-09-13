import { createMemo, splitProps, type Component, type JSX } from "solid-js"
import type { TabsProps } from "./tabs"
import { tabsTheme } from "./tabs.theme"

export interface RLSTabsProps extends TabsProps {
  children?: JSX.Element
}

const RLSTabs: Component<RLSTabsProps> = (allProps) => {
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
    tabsTheme({
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

export default RLSTabs
