import { createMemo, splitProps, type Component, type JSX } from "solid-js"
import type { FormFieldProps } from "./form-field"
import { formFieldTheme } from "./form-field.theme"

export interface RLFormFieldProps extends FormFieldProps {
  children?: JSX.Element
  hint?: JSX.Element
  labelSlot?: JSX.Element
  descriptionSlot?: JSX.Element
  errorSlot?: JSX.Element
  helpSlot?: JSX.Element
}

const RLFormField: Component<RLFormFieldProps> = (allProps) => {
  const [props, rest] = splitProps(allProps, [
    "id",
    "label",
    "description",
    "error",
    "required",
    "size",
    "ui",
    "class",
    "children",
    "hint",
    "labelSlot",
    "descriptionSlot",
    "errorSlot",
    "helpSlot"
  ])

  const resolvedClasses = createMemo(() =>
    formFieldTheme({
      size: props.size ?? "md",
      ui: props.ui,
      class: props.class
    })
  )

  return (
    <div class={resolvedClasses().root} data-slot="root" {...rest}>
      {props.label || props.labelSlot || props.hint ? (
        <div class="flex items-center justify-between gap-2">
          <label for={props.id} class={resolvedClasses().label} data-slot="label">
            {props.labelSlot ? props.labelSlot : props.label}
            {props.required && <span class="text-error-500 ml-0.5">*</span>}
          </label>
          {props.hint}
        </div>
      ) : null}

      {props.description || props.descriptionSlot ? (
        <p class={resolvedClasses().description} data-slot="description">
          {props.descriptionSlot ? props.descriptionSlot : props.description}
        </p>
      ) : null}

      <div class="relative w-full">{props.children}</div>

      {props.error || props.errorSlot ? (
        <p class={resolvedClasses().error} data-slot="error">
          {props.errorSlot ? props.errorSlot : props.error}
        </p>
      ) : null}

      {props.helpSlot ? <div class="mt-1">{props.helpSlot}</div> : null}
    </div>
  )
}

export { RLFormField }
export default RLFormField
