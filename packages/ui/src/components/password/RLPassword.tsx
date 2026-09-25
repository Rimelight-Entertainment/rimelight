import { createMemo, omit, type Component } from "solid-js"
import type { JSX } from "@solidjs/web"
import type { PasswordProps } from "./password"
import { passwordTheme } from "./password.theme"

export interface RLPasswordProps extends PasswordProps {
  children?: JSX.Element
}

const RLPassword: Component<RLPasswordProps> = (allProps) => {
  const props = allProps
  const rest = omit(allProps, "ui", "class", "children")

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
