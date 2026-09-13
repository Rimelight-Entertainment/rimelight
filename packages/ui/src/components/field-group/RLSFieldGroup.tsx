import { createMemo, splitProps, type Component, type JSX } from "solid-js"
import type { FieldGroupProps } from "./field-group"
import { fieldGroupTheme } from "./field-group.theme"

export interface RLSFieldGroupProps extends Omit<FieldGroupProps, "prepend" | "append"> {
  prepend?: JSX.Element
  append?: JSX.Element
  children?: JSX.Element
}

const RLSFieldGroup: Component<RLSFieldGroupProps> = (allProps) => {
  const [props, rest] = splitProps(allProps, [
    "prepend",
    "append",
    "size",
    "ui",
    "class",
    "children"
  ])

  const resolvedClasses = createMemo(() =>
    fieldGroupTheme({
      size: props.size ?? "md",
      ui: props.ui,
      class: props.class
    })
  )

  return (
    <div class={resolvedClasses().root} data-slot="root" {...rest}>
      {props.prepend ? (
        <div class={resolvedClasses().prepend} data-slot="prepend">
          {props.prepend}
        </div>
      ) : null}
      {props.children}
      {props.append ? (
        <div class={resolvedClasses().append} data-slot="append">
          {props.append}
        </div>
      ) : null}
    </div>
  )
}

export default RLSFieldGroup
