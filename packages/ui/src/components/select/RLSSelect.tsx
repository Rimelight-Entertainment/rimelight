import { createMemo, createSignal, splitProps, For, type Component, type JSX } from "solid-js"
import type { SelectItem, SelectProps } from "./select"
import { selectTheme } from "./select.theme"
import RLSButton, { type RLSButtonProps } from "../button/RLSButton"
import RLSIcon from "../icon/RLSIcon"

export interface RLSSelectProps extends Partial<Omit<SelectProps, "onChange" | "onBlur">> {
  id?: string
  name?: string
  value?: string | number | (string | number)[]
  defaultValue?: string | number | (string | number)[]
  placeholder?: string
  disabled?: boolean
  required?: boolean
  multiple?: boolean
  size?: "xs" | "sm" | "md" | "lg" | "xl"
  variant?: "default" | "icon" | "outline" | "soft" | "subtle" | "ghost" | "none"
  buttonVariant?: RLSButtonProps["variant"]
  buttonColor?: RLSButtonProps["color"]
  class?: string
  items?: SelectItem[]
  leadingIcon?: string
  leading?: JSX.Element
  children?: JSX.Element
  theme?: string
  ui?: any
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
    "multiple",
    "size",
    "variant",
    "buttonVariant",
    "buttonColor",
    "class",
    "items",
    "leadingIcon",
    "leading",
    "children",
    "theme",
    "ui",
    "onChange",
    "onBlur"
  ])

  const resolvedVariant = () =>
    props.variant === "default" || props.variant === "icon" ? props.variant : "default"

  const buttonVariant = () => props.buttonVariant ?? "ghost"
  const buttonColor = () => props.buttonColor ?? "neutral"

  const classes = createMemo(() =>
    selectTheme({
      size: props.size,
      variant: resolvedVariant(),
      ui: props.ui,
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
      ? props.value
      : props.defaultValue !== undefined
        ? props.defaultValue
        : undefined
  )

  const labelFrom = (value?: string | number | (string | number)[]) => {
    if (props.placeholder && (value === undefined || value === "")) return props.placeholder
    if (Array.isArray(value)) return props.placeholder ?? ""
    const item = normalizedItems().find((i) => String(i.value) === String(value))
    return item?.label ?? ""
  }

  const [labelText, setLabelText] = createSignal(labelFrom(currentValue()))

  const handleChange = (e: Event & { currentTarget: HTMLSelectElement }) => {
    setLabelText(e.currentTarget.options[e.currentTarget.selectedIndex]?.text ?? "")
    props.onChange?.(e)
  }

  const triggerProps = () => {
    const p: RLSButtonProps = {
      "variant": buttonVariant(),
      "color": buttonColor(),
      "square": true,
      "aria-hidden": "true",
      "tabIndex": -1,
      "data-slot": "trigger",
      "type": "button"
    }
    if (props.size) p.size = props.size
    if (props.disabled !== undefined) p.disabled = props.disabled
    if (props.leadingIcon) p.leadingIcon = props.leadingIcon
    if (props.leading) p.leading = props.leading
    return p
  }

  return (
    <div class={classes().root} data-slot="root" data-theme={props.theme}>
      {resolvedVariant() === "icon" ? (
        <RLSButton data-slot="trigger" {...triggerProps()} />
      ) : props.leading ? (
        <span class={classes().leading} data-slot="leading">
          {props.leading}
        </span>
      ) : props.leadingIcon ? (
        <span class={classes().leading} data-slot="leading">
          <RLSIcon name={props.leadingIcon} size="sm" class="size-4" />
        </span>
      ) : null}

      {resolvedVariant() !== "icon" ? (
        <span class={classes().label} data-slot="label" aria-hidden="true">
          {labelText()}
        </span>
      ) : null}

      <select
        id={props.id}
        name={props.name}
        disabled={props.disabled}
        required={props.required}
        multiple={props.multiple}
        onChange={handleChange}
        onBlur={props.onBlur}
        class={classes().select}
        data-slot="select"
        {...rest}
      >
        {props.placeholder && !props.multiple ? (
          <option value="" disabled selected={!currentValue()}>
            {props.placeholder}
          </option>
        ) : null}

        {props.children ? (
          props.children
        ) : (
          <For each={normalizedItems()}>
            {(item) => {
              const val = currentValue()
              const isSelected = Array.isArray(val)
                ? val.map(String).includes(String(item.value))
                : val !== undefined
                  ? String(val) === String(item.value)
                  : undefined
              return (
                <option value={item.value} disabled={item.disabled} selected={isSelected}>
                  {item.icon ? <RLSIcon name={item.icon} class="rl-select-item-icon" /> : null}
                  {item.avatar ? (
                    <img src={item.avatar.src} alt={item.avatar.alt} class="rl-select-item-icon" />
                  ) : null}
                  {item.label}
                </option>
              )
            }}
          </For>
        )}
      </select>

      {/* Custom Chevron arrow */}
      {resolvedVariant() !== "icon" ? (
        <span class={classes().icon} data-slot="icon">
          <RLSIcon name="chevronDown" size="sm" class="size-4" aria-hidden="true" />
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
