import { createMemo, splitProps, type Component, type JSX } from "solid-js"
import type { ErrorProps } from "./error"
import { errorTheme } from "./error.theme"

export interface RLErrorProps extends ErrorProps {
  children?: JSX.Element
}

const RLError: Component<RLErrorProps> = (allProps) => {
  const [props, rest] = splitProps(allProps, ["ui", "class", "children"])

  const classes = createMemo(() =>
    errorTheme({
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

export { RLError }
export default RLError
