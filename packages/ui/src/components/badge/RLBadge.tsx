import { createMemo, omit, type Component } from "solid-js"
import type { JSX } from "@solidjs/web"
import type { BadgeProps } from "./badge"
import { badgeTheme } from "./badge.theme"

export interface RLBadgeProps extends BadgeProps {
  children?: JSX.Element
}

const RLBadge: Component<RLBadgeProps> = (allProps) => {
  const props = allProps
  const rest = omit(
    allProps,
    "label",
    "variant",
    "color",
    "size",
    "shape",
    "theme",
    "ui",
    "class",
    "children"
  )

  const resolvedClasses = createMemo(() =>
    badgeTheme({
      variant: props.variant ?? "solid",
      color: props.color ?? "primary",
      size: props.size ?? "md",
      shape: props.shape ?? "pill",
      theme: props.theme,
      ui: props.ui,
      class: props.class
    })
  )

  return (
    <span class={resolvedClasses().root} data-slot="root" data-theme={props.theme} {...rest}>
      {props.children !== undefined && props.children !== null ? props.children : props.label}
    </span>
  )
}

export { RLBadge }
