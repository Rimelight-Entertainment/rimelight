import { createMemo, splitProps, type Component, type JSX } from "solid-js"
import type { PasswordProps } from "./password"
import { passwordTheme } from "./password.theme"

export interface RLPasswordProps extends PasswordProps {
  children?: JSX.Element
}

const RLPassword: Component<RLPasswordProps> = (allProps) => {
  const [props, rest] = splitProps(allProps, ["ui", "class", "children"])

  const resolvedClasses = createMemo(() =>
    passwordTheme({
      ui: props.ui,
      class: props.class,
      ...allProps
    })
  )

  return (
    <div class={resolvedClasses().root} data-slot="root" {...rest}>
      {props.children}
    </div>
  )
}

export { RLPassword }
export default RLPassword
