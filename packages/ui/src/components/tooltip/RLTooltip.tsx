import { createMemo, splitProps, type Component, type JSX } from "solid-js"
import type { TooltipProps } from "./tooltip"
import { tooltipTheme } from "./tooltip.theme"

export interface RLTooltipProps extends TooltipProps {
  children?: JSX.Element
  contentSlot?: JSX.Element
}

const RLTooltip: Component<RLTooltipProps> = (allProps) => {
  const [props, rest] = splitProps(allProps, [
    "content",
    "placement",
    "ui",
    "class",
    "children",
    "contentSlot"
  ])

  const placement = () => props.placement ?? "top"

  const resolvedClasses = createMemo(() =>
    tooltipTheme({
      placement: placement(),
      ui: props.ui,
      class: props.class
    })
  )

  return (
    <div
      class={resolvedClasses().root}
      data-slot="tooltip-container"
      data-placement={placement()}
      {...rest}
    >
      <div class={resolvedClasses().trigger} data-slot="trigger" tabIndex={0}>
        {props.children}
      </div>

      <div class={resolvedClasses().content} data-slot="content" role="tooltip">
        {props.contentSlot !== undefined ? props.contentSlot : props.content}
      </div>
    </div>
  )
}

export { RLTooltip }
export default RLTooltip
