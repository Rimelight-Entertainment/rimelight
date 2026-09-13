import { createMemo, splitProps, type Component, type JSX } from "solid-js"
import type { BadgeProps } from "./badge"
import { badgeTheme } from "./badge.theme"

export interface RLSBadgeProps extends BadgeProps {
  children?: JSX.Element
}

const RLSBadge: Component<RLSBadgeProps> = (allProps) => {
  const [props, rest] = splitProps(allProps, [
    "label",
    "variant",
    "color",
    "size",
    "shape",
    "theme",
    "ui",
    "class",
    "children"
  ])

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

export default RLSBadge
