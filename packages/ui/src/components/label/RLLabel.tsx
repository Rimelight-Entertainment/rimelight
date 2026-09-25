import { createMemo, splitProps, type Component, type JSX } from "solid-js"
import type { LabelProps } from "./label"
import { labelTheme } from "./label.theme"

export interface RLLabelProps extends LabelProps {
  children?: JSX.Element
}

const RLLabel: Component<RLLabelProps> = (allProps) => {
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

export { RLLabel }
export default RLLabel
