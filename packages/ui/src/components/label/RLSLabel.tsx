import { createMemo, splitProps, type Component, type JSX } from "solid-js"
import type { LabelProps } from "./label"
import { labelTheme } from "./label.theme"

export interface RLSLabelProps extends LabelProps {
  children?: JSX.Element
}

const RLSLabel: Component<RLSLabelProps> = (allProps) => {
  const [props, rest] = splitProps(allProps, ["for", "size", "ui", "class", "children"])

  const classes = createMemo(() =>
    labelTheme({
      size: props.size ?? "md",
      ui: props.ui,
      class: props.class
    })
  )

  return (
    <label class={classes()["root"]} data-slot="root" for={props.for} {...rest}>
      {props.children}
    </label>
  )
}

export default RLSLabel
