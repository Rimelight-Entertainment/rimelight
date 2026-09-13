import { createMemo, splitProps, For, type Component, type JSX } from "solid-js"
import type { SelectItem } from "./select"
import { selectTheme } from "./select.theme"
import RLSIcon from "../icon/RLSIcon"

export interface RLSSelectProps {
  id?: string
  name?: string
  value?: string | number
  defaultValue?: string | number
  placeholder?: string
  disabled?: boolean
  required?: boolean
  size?: "xs" | "sm" | "md" | "lg" | "xl"
  variant?: "default" | "icon" | "outline" | "soft" | "subtle" | "ghost" | "none"
  class?: string
  items?: SelectItem[]
  leading?: JSX.Element
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
    "variant",
    "class",
    "items",
    "leading",
    "children",
    "onChange",
    "onBlur"
  ])

  const resolvedVariant = () =>
    props.variant === "default" || props.variant === "icon" ? props.variant : "default"

  const classes = createMemo(() =>
    selectTheme({
      size: props.size,
      variant: resolvedVariant(),
      class: props.class
    })
  )

  const normalizedItems = createMemo(() => {
    if (!props.items) return []
    return props.items.map((item: SelectItem) => {
      if (typeof item === "string" || typeof item === "number" || typeof item === "boolean") {
        return { label: String(item), value: String(item), disabled: false }
      }
      const i = item as {
        label?: string
        value?: any
        disabled?: boolean
        icon?: string
        avatar?: { src?: string; alt?: string; loading?: "lazy" | "eager" }
      }
      return {
        label: String(i.label ?? i.value ?? ""),
        value: String(i.value ?? ""),
        disabled: !!i.disabled,
        icon: i.icon,
        avatar: i.avatar
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
      {props.leading ? (
        <span class={classes().leading} data-slot="leading">
          {props.leading}
        </span>
      ) : null}

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
                {item.icon ? <RLSIcon name={item.icon} class="rl-select-item-icon" /> : null}
                {item.avatar ? (
                  <img src={item.avatar.src} alt={item.avatar.alt} class="rl-select-item-icon" />
                ) : null}
                {item.label}
              </option>
            )}
          </For>
        )}
      </select>

      {/* Custom Chevron arrow */}
      {resolvedVariant() !== "icon" ? (
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
      ) : null}

      <style>{`
        select.rl-select,
        select.rl-select::picker(select) { appearance: base-select; }
        select.rl-select::picker-icon { display: none; }
        select.rl-select::picker(select) {
          border: 1px solid var(--rl-neutral-200);
          border-radius: var(--radius-md, 0.375rem);
          background-color: var(--rl-neutral-100);
          color: var(--rl-neutral-950);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.25), 0 4px 6px -4px rgba(0, 0, 0, 0.15);
          padding: 0.25rem;
          margin-top: 0.25rem;
        }
        select.rl-select option {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          padding: 0.375rem 0.625rem;
          border-radius: calc(var(--radius-md, 0.375rem) - 0.125rem);
          background-color: var(--rl-neutral-100);
          color: var(--rl-neutral-950);
          font-size: 0.875rem;
          cursor: pointer;
          transition: background-color 0.15s ease, color 0.15s ease;
        }
        select.rl-select .rl-select-item-icon {
          width: 1rem;
          height: 1rem;
          flex-shrink: 0;
        }
        select.rl-select option:hover,
        select.rl-select option:focus {
          background-color: var(--rl-neutral-200);
          color: var(--rl-neutral-950);
        }
        select.rl-select option:checked {
          background-color: var(--rl-primary-500);
          color: var(--rl-neutral-50);
          font-weight: 500;
        }
      `}</style>
    </div>
  )
}

export default RLSSelect
