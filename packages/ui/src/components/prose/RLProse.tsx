import { createMemo, splitProps, type Component, type JSX } from "solid-js"
import type { ProseProps } from "./prose"
import { proseTheme } from "./prose.theme"

export interface RLProseProps extends ProseProps {
  children?: JSX.Element
}

const RLProse: Component<RLProseProps> = (allProps) => {
  const [props, rest] = splitProps(allProps, ["ui", "class", "children"])

  const classes = createMemo(() =>
    proseTheme({
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

export { RLProse }
export default RLProse
