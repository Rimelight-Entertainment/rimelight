import { createMemo, splitProps, type Component, type JSX } from "solid-js"
import type { UserProps } from "./user"
import { userTheme } from "./user.theme"

export interface RLSUserProps extends UserProps {
  children?: JSX.Element
}

const RLSUser: Component<RLSUserProps> = (allProps) => {
  const [props, rest] = splitProps(allProps, ["ui", "class", "children"])

  const classes = createMemo(() =>
    userTheme({
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

export default RLSUser
