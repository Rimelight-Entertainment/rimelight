import { createMemo, createSignal, splitProps, For, type Component } from "solid-js"
import type { InputRatingProps } from "./input-rating"
import { inputRatingTheme } from "./input-rating.theme"
import RLSIcon from "../icon/RLSIcon"

export interface RLSInputRatingProps extends InputRatingProps {
  onValueChange?: (value: number) => void
}

const RLSInputRating: Component<RLSInputRatingProps> = (allProps) => {
  const [props, rest] = splitProps(allProps, [
    "id",
    "readonly",
    "icon",
    "emptyIcon",
    "color",
    "size",
    "orientation",
    "step",
    "disabled",
    "required",
    "name",
    "modelValue",
    "defaultValue",
    "value",
    "length",
    "clearable",
    "hoverable",
    "ui",
    "class",
    "onValueChange"
  ])

  const resolvedClasses = createMemo(() =>
    inputRatingTheme({
      color: props.color ?? "primary",
      size: props.size ?? "md",
      orientation: props.orientation ?? "horizontal",
      readonly: !!props.readonly,
      disabled: !!props.disabled,
      ui: props.ui,
      class: props.class
    })
  )

  const step = () => props.step ?? 1
  const length = () => props.length ?? 5
  const itemSize = () => {
    const map: Record<string, string> = {
      xs: "0.75rem",
      sm: "1rem",
      md: "1.25rem",
      lg: "1.5rem",
      xl: "1.75rem"
    }
    return map[props.size ?? "md"] ?? "1.25rem"
  }

  const [internalValue, setInternalValue] = createSignal<number>(
    props.value !== undefined
      ? props.value
      : props.modelValue !== undefined
        ? props.modelValue
        : (props.defaultValue ?? 0)
  )
  const value = () =>
    props.value !== undefined
      ? props.value
      : props.modelValue !== undefined
        ? props.modelValue
        : internalValue()

  const [hoverValue, setHoverValue] = createSignal<number | null>(null)
  const display = () => (hoverValue() !== null ? hoverValue() : value())

  const items = createMemo(() => Array.from({ length: length() }, (_, idx) => idx + 1))

  const getWidthForVal = (val: number, itemIndex: number) => {
    if (val >= itemIndex) return "100%"
    if (val <= itemIndex - 1) return "0%"
    return `${(val - (itemIndex - 1)) * 100}%`
  }

  const getValueFromEvent = (e: MouseEvent, el: HTMLElement, index: number) => {
    const rect = el.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const steppedX = Math.ceil(x / step()) * step()
    return Math.min(Math.max(index - 1 + steppedX, 0), length())
  }

  const handleMouseMove = (e: MouseEvent, el: HTMLElement, index: number) => {
    if (props.disabled || props.readonly) return
    if (props.hoverable) setHoverValue(getValueFromEvent(e, el, index))
  }

  const handleMouseLeave = () => {
    setHoverValue(null)
  }

  const handleClick = (e: MouseEvent, el: HTMLElement, index: number) => {
    if (props.disabled || props.readonly) return
    const val = getValueFromEvent(e, el, index)
    let finalVal = val
    if (props.clearable && value() === val) finalVal = 0
    if (props.value === undefined && props.modelValue === undefined) setInternalValue(finalVal)
    props.onValueChange?.(finalVal)
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (props.disabled || props.readonly) return
    let newVal = value()
    if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      newVal = Math.min(value() + step(), length())
    } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      newVal = Math.max(value() - step(), 0)
    } else if (e.key === "Home") {
      newVal = 0
    } else if (e.key === "End") {
      newVal = length()
    } else {
      return
    }
    e.preventDefault()
    if (props.value === undefined && props.modelValue === undefined) setInternalValue(newVal)
    props.onValueChange?.(newVal)
  }

  return (
    <div
      class={resolvedClasses().root}
      data-slot="root"
      data-step={step()}
      data-length={length()}
      data-clearable={props.clearable ? "true" : "false"}
      data-hoverable={props.hoverable ? "true" : "false"}
      data-disabled={props.disabled ? "true" : "false"}
      data-readonly={props.readonly ? "true" : "false"}
      id={props.id}
      role="slider"
      aria-valuenow={value()}
      aria-valuemin={0}
      aria-valuemax={length()}
      aria-readonly={props.readonly ? "true" : "false"}
      aria-disabled={props.disabled ? "true" : "false"}
      tabIndex={props.disabled || props.readonly ? undefined : 0}
      onKeyDown={handleKeyDown}
      {...rest}
    >
      <input
        type="hidden"
        name={props.name}
        value={value()}
        required={props.required}
        disabled={props.disabled || props.readonly}
        class="rating-hidden-input"
      />

      <For each={items()}>
        {(i) => (
          <div
            class={`input-rating-item ${resolvedClasses().item}`}
            data-slot="item"
            data-index={i}
            style={{ "--item-size": itemSize(), "width": itemSize(), "height": itemSize() }}
            onMouseMove={(e) => handleMouseMove(e, e.currentTarget, i)}
            onMouseLeave={handleMouseLeave}
            onClick={(e) => handleClick(e, e.currentTarget, i)}
          >
            <div class={resolvedClasses().emptyIcon} data-slot="emptyIcon">
              <RLSIcon
                name={props.emptyIcon || props.icon || "star"}
                size={props.size ?? "md"}
                class={resolvedClasses().icon}
                aria-hidden="true"
              />
            </div>

            <div
              class={`rating-item-indicator ${resolvedClasses().indicator}`}
              data-slot="indicator"
              data-state={display() >= i - 0.99 ? "active" : "inactive"}
              style={{ width: getWidthForVal(display(), i) }}
            >
              <RLSIcon
                name={props.icon || "star"}
                size={props.size ?? "md"}
                class={resolvedClasses().icon}
                aria-hidden="true"
              />
            </div>
          </div>
        )}
      </For>
    </div>
  )
}

export default RLSInputRating
