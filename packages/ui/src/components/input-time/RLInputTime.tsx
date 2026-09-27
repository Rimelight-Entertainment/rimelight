import { createMemo, omit, type Component } from "solid-js"
import type { JSX } from "@solidjs/web"
import type { InputTimeProps } from "./input-time"
import { inputTimeTheme } from "./input-time.theme"
import { inputTheme } from "../input/input.theme"

export interface RLInputTimeProps extends InputTimeProps {
  children?: JSX.Element
  value?: string
  defaultValue?: string
  name?: string
  placeholder?: string
  disabled?: boolean
  readonly?: boolean
  required?: boolean
  min?: string
  max?: string
  step?: number
  size?: "sm" | "md" | "lg"
  onInput?: (e: InputEvent & { currentTarget: HTMLInputElement }) => void
  onChange?: (e: Event & { currentTarget: HTMLInputElement }) => void
  onBlur?: (e: FocusEvent & { currentTarget: HTMLInputElement }) => void
  onFocus?: (e: FocusEvent & { currentTarget: HTMLInputElement }) => void
  onKeyDown?: (e: KeyboardEvent & { currentTarget: HTMLInputElement }) => void
}

const RLInputTime: Component<RLInputTimeProps> = (allProps) => {
  const props = allProps
  const rest = omit(
    allProps,
    "children",
    "value",
    "defaultValue",
    "name",
    "placeholder",
    "disabled",
    "readonly",
    "required",
    "min",
    "max",
    "step",
    "size",
    "ui",
    "class",
    "onInput",
    "onChange",
    "onBlur",
    "onFocus",
    "onKeyDown"
  )

  const resolvedClasses = createMemo(() =>
    inputTimeTheme({
      ui: props.ui,
      class: props.class
    })
  )

  const inputClasses = createMemo(() =>
    inputTheme({
      variant: "default",
      size: props.size ?? "md",
      error: false,
      ui: props.ui
    })
  )

  return (
    <div class={`${resolvedClasses().root} ${inputClasses().root}`} data-slot="root">
      <input
        type="time"
        name={props.name}
        value={props.value !== undefined ? props.value : (props.defaultValue ?? "")}
        placeholder={props.placeholder}
        disabled={props.disabled}
        readonly={props.readonly}
        required={props.required}
        min={props.min}
        max={props.max}
        step={props.step}
        class={inputClasses().input}
        data-slot="input"
        onInput={props.onInput}
        onChange={props.onChange}
        onBlur={props.onBlur}
        onFocus={props.onFocus}
        onKeyDown={props.onKeyDown}
        {...rest}
      />
      {props.children}
    </div>
  )
}

export { RLInputTime }
