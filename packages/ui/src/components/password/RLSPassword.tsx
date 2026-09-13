import { createMemo, splitProps, type Component, type JSX } from "solid-js"
import type { PasswordProps } from "./password"
import { passwordTheme } from "./password.theme"

export interface RLSPasswordProps extends PasswordProps {
  children?: JSX.Element
}

const RLSPassword: Component<RLSPasswordProps> = (allProps) => {
  const [props, rest] = splitProps(allProps, [
    "ui",
    "class",
    "children",
    "checked",
    "disabled",
    "name",
    "label",
    "value",
    "trailing"
  ])

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

export default RLSPassword
