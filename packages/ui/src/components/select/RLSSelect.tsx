import { createMemo, splitProps, For, type Component, type JSX } from "solid-js"
import type { SelectItem } from "./select"

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

const SIZE_CLASSES = {
  xs: "py-0.5 pl-2 pr-6 text-xs",
  sm: "py-1 pl-2.5 pr-7 text-xs",
  md: "py-1.5 pl-3 pr-8 text-sm",
  lg: "py-2 pl-3.5 pr-9 text-base",
  xl: "py-2.5 pl-4 pr-10 text-base"
} as const

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

  const sizeClass = createMemo(() => SIZE_CLASSES[props.size ?? "md"])

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
    <div class={`relative inline-flex items-center w-full ${props.class || ""}`}>
      <select
        id={props.id}
        name={props.name}
        disabled={props.disabled}
        required={props.required}
        onChange={props.onChange}
        onBlur={props.onBlur}
        class={`rl-select w-full cursor-pointer rounded-md border border-default bg-default ${sizeClass()} text-foreground shadow-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50`}
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
      <span class="pointer-events-none absolute right-2 flex items-center text-muted-foreground">
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

      <style>{`
        select.rl-select, select.rl-select::picker(select) { appearance: base-select; }
        select.rl-select::picker-icon { display: none; }
        select.rl-select::picker(select) { border: 1px solid var(--rl-neutral-200); border-radius: var(--radius, 0.5rem); background-color: var(--rl-neutral-100); color: var(--rl-neutral-950); box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.25), 0 4px 6px -4px rgba(0, 0, 0, 0.15); padding: 0.25rem; margin-top: 0.25rem; }
        select.rl-select option { padding: 0.375rem 0.625rem; border-radius: calc(var(--radius, 0.5rem) - 0.125rem); background-color: var(--rl-neutral-100); color: var(--rl-neutral-950); font-size: 0.875rem; cursor: pointer; transition: background-color 0.15s ease, color 0.15s ease; }
        select.rl-select option:hover, select.rl-select option:focus { background-color: var(--rl-neutral-200); color: var(--rl-neutral-950); }
        select.rl-select option:checked { background-color: var(--rl-primary-500); color: var(--primary-foreground, #ffffff); font-weight: 500; }
      `}</style>
    </div>
  )
}

export default RLSSelect
