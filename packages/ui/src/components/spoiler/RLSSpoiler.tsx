import { createMemo, splitProps, type Component, type JSX } from "solid-js"
import type { SpoilerProps } from "./spoiler"
import { spoilerTheme } from "./spoiler.theme"

export interface RLSSpoilerProps extends SpoilerProps {
  children?: JSX.Element
}

const RLSSpoiler: Component<RLSSpoilerProps> = (allProps) => {
  const [props, rest] = splitProps(allProps, ["ui", "class", "children"])

  const classes = createMemo(() =>
    spoilerTheme({
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

export default RLSSpoiler
