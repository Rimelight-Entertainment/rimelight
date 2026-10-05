import type { RLSelectProps, SelectItem } from "./select.types";
import { RLSelectTheme } from "./select.theme";
import { createMemo, createSignal, omit, For, type Component } from "solid-js";
import { RLButton } from "../button/RLButton";
import type { RLButtonProps } from "../button/button.types";
import { RLIcon } from "../icon/RLIcon";

export const RLSelect: Component<RLSelectProps> = (allProps) => {
  const props = allProps;
  const rest = omit(
    allProps,
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
    "onBlur",
  );

  const resolvedVariant = () =>
    props.variant === "default" || props.variant === "icon" ? props.variant : "default";

  const buttonVariant = () => props.buttonVariant ?? "ghost";
  const buttonColor = () => props.buttonColor ?? "neutral";

  const classes = createMemo(() =>
    RLSelectTheme({
      size: props.size,
      variant: resolvedVariant(),
      ui: props.ui,
      class: props.class,
    }),
  );

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

  const currentLabel = createMemo(() => {
    const val = currentValue();
    if (props.placeholder && (val === undefined || val === "")) return props.placeholder;
    if (Array.isArray(val)) return props.placeholder ?? "";
    const item = normalizedItems().find((i) => String(i.value) === String(val));
    return item?.label ?? "";
  });

  const currentValueStr = createMemo(() => {
    const val = currentValue();
    return val !== undefined ? String(val) : undefined;
  });

  const optionsWithSelection = createMemo(() => {
    const val = currentValue();
    return normalizedItems().map((item) => {
      const isSelected = Array.isArray(val)
        ? val.map(String).includes(String(item.value))
        : val !== undefined
          ? String(val) === String(item.value)
          : undefined;
      return { item, isSelected };
    });
  });

  const handleChange = (e: Event & { currentTarget: HTMLSelectElement }) => {
    setInternalValue(e.currentTarget.value);
    props.onChange?.(e);
  };

  const triggerProps = () => {
    const p: RLButtonProps = {
      variant: buttonVariant(),
      color: buttonColor(),
      square: true,
      "aria-hidden": "true",
      tabIndex: -1,
      "data-slot": "trigger",
      type: "button",
    };
    if (props.size) p.size = props.size;
    if (props.disabled !== undefined) p.disabled = props.disabled;
    if (props.leadingIcon) p.leadingIcon = props.leadingIcon;
    if (props.leading) p.leading = props.leading;
    return p;
  };

  return (
    <div class={classes().root} data-slot="root" data-theme={props.theme}>
      {resolvedVariant() === "icon" ? (
        <RLButton data-slot="trigger" {...triggerProps()} />
      ) : props.leading ? (
        <span class={classes().leading} data-slot="leading">
          {props.leading}
        </span>
      ) : props.leadingIcon ? (
        <span class={classes().leading} data-slot="leading">
          <RLIcon name={props.leadingIcon} size="sm" class="size-4" />
        </span>
      ) : null}

      {resolvedVariant() !== "icon" ? (
        <span class={classes().label} data-slot="label" aria-hidden="true">
          {currentLabel()}
        </span>
      ) : null}

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
        {...rest}
      >
        {props.placeholder && !props.multiple ? (
          <option value="" disabled selected={!currentValue()} class="bg-default text-highlighted">
            {props.placeholder}
          </option>
        ) : null}

        {props.children ? (
          props.children
        ) : (
          <For each={optionsWithSelection()}>
            {({ item, isSelected }) => (
              <option
                value={item.value}
                disabled={item.disabled}
                selected={isSelected}
                class="bg-default text-highlighted"
              >
                {item.label}
              </option>
            )}
          </For>
        )}
      </select>

      {/* Custom Chevron arrow */}
      {resolvedVariant() !== "icon" ? (
        <span class={classes().icon} data-slot="icon">
          <RLIcon name="chevronDown" size="sm" class="size-4" aria-hidden="true" />
        </span>
      ) : null}
    </div>
  );
};
