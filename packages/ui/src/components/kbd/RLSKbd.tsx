import { createMemo, splitProps, type Component, type JSX } from "solid-js"
import type { KbdProps } from "./kbd"
import { kbdTheme } from "./kbd.theme"

export interface RLSKbdProps extends KbdProps {
  children?: JSX.Element
}

const RLSKbd: Component<RLSKbdProps> = (allProps) => {
  const [props, rest] = splitProps(allProps, [
    "color",
    "variant",
    "size",
    "theme",
    "ui",
    "class",
    "children"
  ])

  const classes = createMemo(() =>
    kbdTheme({
      color: props.color ?? "neutral",
      variant: props.variant ?? "outline",
      size: props.size ?? "md",
      ui: props.ui,
      class: props.class
    })
  )

  return (
    <kbd class={classes()["root"]} data-slot="root" data-theme={props.theme} {...rest}>
      {props.children}
    </kbd>
  )
}

export default RLSKbd
