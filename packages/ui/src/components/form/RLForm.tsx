import { createMemo, omit, type Component } from "solid-js"
import type { JSX } from "@solidjs/web"
import type { FormProps } from "./form"
import { formTheme } from "./form.theme"

export interface RLFormProps extends FormProps {
  children?: JSX.Element
  onSubmit?: (e: Event & { currentTarget: HTMLFormElement }) => void
}

const RLForm: Component<RLFormProps> = (allProps) => {
  const props = allProps
  const rest = omit(allProps, "schema", "state", "ui", "class", "children", "onSubmit")

  const resolvedClasses = createMemo(() =>
    formTheme({
      ui: props.ui,
      class: props.class
    })
  )

  return (
    <form class={resolvedClasses().root} data-slot="root" onSubmit={props.onSubmit} {...rest}>
      {props.children}
    </form>
  )
}

export { RLForm }
