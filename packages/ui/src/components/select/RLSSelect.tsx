import { createMemo, splitProps, For, type Component, type JSX } from "solid-js"
import type { SelectItem } from "./select"
import { selectTheme, selectPickerCss } from "./select.theme"

export interface RLSSelectProps {
  id?: string
  name?: string
  value?: string | number
  defaultValue?: string | number
  placeholder?: string
  disabled?: boolean
  required?: boolean
  size?: "xs" | "sm" | "md" | "lg" | "xl"
  class?: string
  items?: SelectItem[]
  children?: JSX.Element
  onChange?: (e: Event & { currentTarget: HTMLSelectElement }) => void
  onBlur?: (e: FocusEvent & { currentTarget: HTMLSelectElement }) => void
}

const RLSSelect: Component<RLSSelectProps> = (allProps) => {
  const [props, rest] = splitProps(allProps, [
    "id",
    "name",
    "value",
    "defaultValue",
    "placeholder",
    "disabled",
    "required",
    "size",
    "class",
    "items",
    "children",
    "onChange",
    "onBlur"
  ])

  const classes = createMemo(() =>
    selectTheme({
      size: props.size,
      class: props.class
    })
  )

  const normalizedItems = createMemo(() => {
    if (!props.items) return []
    return props.items.map((item: SelectItem) => {
      if (typeof item === "string" || typeof item === "number" || typeof item === "boolean") {
        return { label: String(item), value: String(item), disabled: false }
      }
      const i = item as { label?: string; value?: any; disabled?: boolean }
      return {
        label: String(i.label ?? i.value ?? ""),
        value: String(i.value ?? ""),
        disabled: !!i.disabled
      }
    })
  })

  const currentValue = createMemo(() =>
    props.value !== undefined
      ? String(props.value)
      : props.defaultValue !== undefined
        ? String(props.defaultValue)
        : undefined
  )

  return (
    <div class={`${classes().root}`}>
      <select
        id={props.id}
        name={props.name}
        disabled={props.disabled}
        required={props.required}
        onChange={props.onChange}
        onBlur={props.onBlur}
        class={classes().select}
        data-slot="select"
        {...rest}
      >
        {props.placeholder ? (
          <option value="" disabled selected={!currentValue()}>
            {props.placeholder}
          </option>
        ) : null}

        {props.children ? (
          props.children
        ) : (
          <For each={normalizedItems()}>
            {(item) => (
              <option
                value={item.value}
                disabled={item.disabled}
                selected={currentValue() !== undefined ? currentValue() === item.value : undefined}
              >
                {item.label}
              </option>
            )}
          </For>
        )}
      </select>

      {/* Custom Chevron arrow */}
      <span class={classes().icon} data-slot="icon">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </span>

      <style>{selectPickerCss}</style>
    </div>
  )
}

export default RLSSelect
