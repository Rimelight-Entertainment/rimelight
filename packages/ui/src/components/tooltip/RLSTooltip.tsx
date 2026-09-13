import { createMemo, splitProps, type Component, type JSX } from "solid-js"
import type { TooltipProps } from "./tooltip"
import { tooltipTheme } from "./tooltip.theme"

export interface RLSTooltipProps extends TooltipProps {
  children?: JSX.Element
}

const RLSTooltip: Component<RLSTooltipProps> = (allProps) => {
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
    tooltipTheme({
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

export default RLSTooltip
