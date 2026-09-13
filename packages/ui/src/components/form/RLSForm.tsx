import { createMemo, splitProps, type Component, type JSX } from "solid-js"
import type { FormProps } from "./form"
import { formTheme } from "./form.theme"

export interface RLSFormProps extends FormProps {
  children?: JSX.Element
  onSubmit?: (e: Event & { currentTarget: HTMLFormElement }) => void
}

const RLSForm: Component<RLSFormProps> = (allProps) => {
  const [props, rest] = splitProps(allProps, [
    "schema",
    "state",
    "ui",
    "class",
    "children",
    "onSubmit"
  ])

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

export default RLSForm
