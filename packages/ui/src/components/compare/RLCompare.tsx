import { createMemo, splitProps, type Component, type JSX } from "solid-js"
import type { CompareProps } from "./compare"
import { compareTheme } from "./compare.theme"

export interface RLCompareProps extends CompareProps {
  children?: JSX.Element
}

const RLCompare: Component<RLCompareProps> = (allProps) => {
  const [props, rest] = splitProps(allProps, ["ui", "class", "children"])

  const classes = createMemo(() =>
    compareTheme({
      ui: props.ui,
      class: props.class
    })
  )

  return (
    <div class={classes()["root"]} data-slot="root" {...rest}>
      {props.children}
    </div>
  )
}

export { RLCompare }
export default RLCompare
