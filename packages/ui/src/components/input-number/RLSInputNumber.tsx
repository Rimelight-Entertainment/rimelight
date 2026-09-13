import { createMemo, createSignal, splitProps, type Component, type JSX } from "solid-js"
import type { InputNumberProps } from "./input-number"
import { inputNumberTheme } from "./input-number.theme"
import { inputTheme } from "../input/input.theme"
import RLSIcon from "../icon/RLSIcon"

export interface RLSInputNumberProps extends InputNumberProps {
  children?: JSX.Element
  value?: number
  defaultValue?: number
  min?: number
  max?: number
  step?: number
  name?: string
  placeholder?: string
  disabled?: boolean
  readonly?: boolean
  required?: boolean
  size?: "sm" | "md" | "lg"
  onInput?: (e: InputEvent & { currentTarget: HTMLInputElement }) => void
  onChange?: (e: Event & { currentTarget: HTMLInputElement }) => void
  onBlur?: (e: FocusEvent & { currentTarget: HTMLInputElement }) => void
  onFocus?: (e: FocusEvent & { currentTarget: HTMLInputElement }) => void
  onKeyDown?: (e: KeyboardEvent & { currentTarget: HTMLInputElement }) => void
  onValueChange?: (value: number) => void
}

const RLSInputNumber: Component<RLSInputNumberProps> = (allProps) => {
  const [props, rest] = splitProps(allProps, [
    "children",
    "value",
    "defaultValue",
    "min",
    "max",
    "step",
    "name",
    "placeholder",
    "disabled",
    "readonly",
    "required",
    "size",
    "ui",
    "class",
    "onInput",
    "onChange",
    "onBlur",
    "onFocus",
    "onKeyDown",
    "onValueChange"
  ])

  const resolvedClasses = createMemo(() =>
    inputNumberTheme({
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

  const clamp = (value: number) =>
    Math.min(
      props.max ?? Number.POSITIVE_INFINITY,
      Math.max(props.min ?? Number.NEGATIVE_INFINITY, value)
    )

  const [internalValue, setInternalValue] = createSignal<number | undefined>(props.defaultValue)
  const boundValue = () => (props.value !== undefined ? props.value : internalValue())

  let inputRef: HTMLInputElement | undefined

  const updateValue = (next: number) => {
    const clamped = clamp(next)
    if (props.value === undefined) setInternalValue(clamped)
    props.onValueChange?.(clamped)
  }

  const stepBy = (dir: 1 | -1) => {
    if (props.disabled || props.readonly) return
    const raw = inputRef ? Number(inputRef.value) : Number(boundValue())
    const base = Number.isNaN(raw) ? Number(boundValue() || 0) : raw
    updateValue((Number.isNaN(base) ? 0 : base) + dir * (props.step ?? 1))
    if (inputRef)
      inputRef.value = String(clamp((Number.isNaN(base) ? 0 : base) + dir * (props.step ?? 1)))
  }

  const changeEvent = (el: HTMLInputElement): Event & { currentTarget: HTMLInputElement } => {
    const ev = new Event("change", { bubbles: true })
    Object.defineProperty(ev, "currentTarget", { value: el })
    return ev as Event & { currentTarget: HTMLInputElement }
  }

  const commit = () => {
    const el = inputRef
    if (!el) return
    const raw = Number(el.value)
    if (el.value !== "" && !Number.isNaN(raw)) {
      const clamped = clamp(raw)
      if (props.value === undefined) setInternalValue(clamped)
      if (clamped !== raw) el.value = String(clamped)
      props.onValueChange?.(clamped)
    }
    props.onChange?.(changeEvent(el))
  }

  const handleWheel = (e: WheelEvent) => {
    if (props.disabled || props.readonly) return
    e.preventDefault()
    stepBy(e.deltaY < 0 ? 1 : -1)
  }

  const handleKeyDown = (e: KeyboardEvent & { currentTarget: HTMLInputElement }) => {
    props.onKeyDown?.(e)
    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault()
      stepBy(e.key === "ArrowUp" ? 1 : -1)
    } else if (e.key === "Enter") {
      e.preventDefault()
      commit()
    }
  }

  return (
    <div class={resolvedClasses().root} data-slot="root" {...rest}>
      <div class={`relative w-full ${inputClasses().root}`}>
        <input
          ref={(el) => (inputRef = el)}
          type="number"
          name={props.name}
          value={props.value !== undefined ? props.value : ""}
          placeholder={props.placeholder}
          min={props.min}
          max={props.max}
          step={props.step}
          disabled={props.disabled}
          readonly={props.readonly}
          required={props.required}
          class={`${inputClasses().input} pr-11 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
          data-slot="input"
          onInput={props.onInput}
          onChange={props.onChange}
          onBlur={commit}
          onFocus={props.onFocus}
          onKeyDown={handleKeyDown}
          onWheel={handleWheel}
        />
        <div class="absolute right-1 top-1/2 flex -translate-y-1/2 flex-col">
          <button
            type="button"
            tabIndex={-1}
            aria-label="Increment"
            class="flex size-6 items-center justify-center rounded-sm text-muted hover:bg-muted/60 hover:text-highlighted disabled:cursor-not-allowed disabled:opacity-50"
            data-slot="increment"
            disabled={props.disabled || props.readonly}
            onClick={() => stepBy(1)}
          >
            <RLSIcon name="arrowUp" size="xs" aria-hidden="true" />
          </button>
          <button
            type="button"
            tabIndex={-1}
            aria-label="Decrement"
            class="flex size-6 items-center justify-center rounded-sm text-muted hover:bg-muted/60 hover:text-highlighted disabled:cursor-not-allowed disabled:opacity-50"
            data-slot="decrement"
            disabled={props.disabled || props.readonly}
            onClick={() => stepBy(-1)}
          >
            <RLSIcon name="arrowDown" size="xs" aria-hidden="true" />
          </button>
        </div>
      </div>
      {props.children}
    </div>
  )
}

export default RLSInputNumber
