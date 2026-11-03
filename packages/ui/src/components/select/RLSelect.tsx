import type { RLSelectProps, SelectItem } from "./select.types";
import { RLSelectTheme } from "./select.theme";
import { createMemo, createSignal, For, type Component } from "solid-js";
import { RLIcon } from "../icon/RLIcon";

const OMIT_KEYS = [
  "id",
  "name",
  "value",
  "defaultValue",
  "placeholder",
  "disabled",
  "required",
  "multiple",
  "buttonVariant",
  "buttonColor",
  "items",
  "leadingIcon",
  "leading",
  "onChange",
  "onBlur",
] as const;

export const RLSelect: Component<RLSelectProps> = (props) => {
  const resolvedVariant = () =>
    props.variant === "default" || props.variant === "icon" ? props.variant : "default";

  const { Tag, classes, rest, slots } = RLSelectTheme.setup(props, {
    slots: ["leadingSlot"] as const,
    omit: OMIT_KEYS,
    variants: () => ({ variant: resolvedVariant() }),
  });

  const normalizedItems = createMemo(() => {
    if (!props.items) return [];
    return props.items.map((item: SelectItem | string) => {
      if (typeof item === "string" || typeof item === "number" || typeof item === "boolean") {
        return { label: String(item), value: String(item), disabled: false };
      }
      const i = item as {
        label?: string;
        value?: any;
        disabled?: boolean;
        icon?: string;
        avatar?: { src?: string; alt?: string; loading?: "lazy" | "eager" };
      };
      return {
        label: String(i.label ?? i.value ?? ""),
        value: String(i.value ?? ""),
        disabled: !!i.disabled,
        icon: i.icon,
        avatar: i.avatar,
      };
    });
  });

  const [internalValue, setInternalValue] = createSignal(props.defaultValue);
  const currentValue = createMemo(() =>
    props.value !== undefined ? props.value : internalValue(),
  );

  const currentValueStr = createMemo(() => {
    const val = currentValue();
    return val !== undefined ? String(val) : undefined;
  });

  // Computed per row so <For> keeps the same item objects when only the selection changes.
  const isOptionSelected = (optionValue: string) => {
    const val = currentValue();
    return Array.isArray(val)
      ? val.map(String).includes(optionValue)
      : val !== undefined
        ? String(val) === optionValue
        : undefined;
  };

  const handleChange = (e: Event & { currentTarget: HTMLSelectElement }) => {
    setInternalValue(e.currentTarget.value);
    props.onChange?.(e);
  };

  return (
    <Tag class={classes().root} data-slot="root" data-theme={props.theme}>
      <select
        id={props.id}
        name={props.name}
        disabled={props.disabled}
        required={props.required}
        multiple={props.multiple}
        value={currentValueStr()}
        onChange={handleChange}
        onBlur={props.onBlur}
        class={classes().select}
        data-slot="select"
        data-variant={resolvedVariant()}
        {...rest}
      >
        {/* The select button. <selectedcontent> mirrors the chosen option, so the closed control shows its label. */}
        <button type="button" class={classes().trigger} data-slot="trigger">
          {slots.leadingSlot() ? (
            <span class={classes().leading} data-slot="leading">
              {slots.leadingSlot()}
            </span>
          ) : props.leadingIcon ? (
            <span class={classes().leading} data-slot="leading">
              <RLIcon name={props.leadingIcon} size="sm" class="size-4" />
            </span>
          ) : null}
          <selectedcontent class={classes().label} />
        </button>

        {props.placeholder && !props.multiple ? (
          <option value="" disabled selected={!currentValue()} class="bg-default text-highlighted">
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
                selected={isOptionSelected(String(item.value))}
                class="bg-default text-highlighted"
              >
                {item.label}
              </option>
            )}
          </For>
        )}
      </select>
    </Tag>
  );
};
