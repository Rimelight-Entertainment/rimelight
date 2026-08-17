import { createMemo, splitProps, type Component, type JSX } from "solid-js"
import type { CheckboxProps } from "./checkbox"
import { checkboxTheme } from "./checkbox.theme"
import RLSIcon from "../icon/RLSIcon"

export interface RLSCheckboxProps extends CheckboxProps {
  id?: string
  onChange?: (e: Event & { currentTarget: HTMLInputElement }) => void
  children?: JSX.Element
}

const RLSCheckbox: Component<RLSCheckboxProps> = (allProps) => {
  const [props, rest] = splitProps(allProps, [
    "id",
    "checked",
    "disabled",
    "name",
    "label",
    "size",
    "color",
    "theme",
    "ui",
    "class",
    "onChange",
    "children"
  ])

  const resolvedClasses = createMemo(() =>
    checkboxTheme({
      color: props.color ?? "primary",
      size: props.size ?? "md",
      theme: props.theme,
      ui: props.ui,
      class: props.class
    })
  )

  return (
    <label class={resolvedClasses().root} data-slot="root">
      <input
        id={props.id}
        type="checkbox"
        name={props.name}
        checked={!!props.checked}
        disabled={props.disabled}
        onChange={props.onChange}
        class={resolvedClasses().input}
        data-slot="input"
        {...rest}
      />
      <div class={resolvedClasses().box} data-slot="box">
        <span class={resolvedClasses().indicator} data-slot="indicator">
          <RLSIcon name="check" size="xs" aria-hidden="true" />
        </span>
      </div>
      {props.label || props.children ? (
        <span class={resolvedClasses().label} data-slot="label">
          {props.children !== undefined && props.children !== null ? props.children : props.label}
        </span>
      ) : null}
    </label>
  )
}

export default RLSCheckbox
