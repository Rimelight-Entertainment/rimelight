import { createMemo, omit, type Component } from "solid-js"
import type { JSX } from "@solidjs/web"
import type { CompareProps } from "./compare"
import { compareTheme } from "./compare.theme"

export interface RLCompareProps extends CompareProps {
  children?: JSX.Element
}

const RLCompare: Component<RLCompareProps> = (allProps) => {
  const props = allProps
  const rest = omit(allProps, "ui", "class", "children")

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
