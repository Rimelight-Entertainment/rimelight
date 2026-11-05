import { createMemo, createSignal, For, Show, type Component } from "solid-js";
import { RLButton } from "../button/RLButton";
import { RLIcon } from "../icon/RLIcon";
import { renderSlot } from "../../slot";
import { RLSelectTheme } from "./select.theme";
import type { RLSelectProps } from "./select.types";

const OMIT_KEYS = [
  "id",
  "name",
  "value",
  "defaultValue",
  "placeholder",
  "disabled",
  "required",
  "multiple",
  "items",
  "leadingIcon",
  "onChange",
  "onBlur",
  "ref",
] as const;

export const RLSelect: Component<RLSelectProps> = (props) => {
  const { Tag, classes, rest, slots, id, children, theme } = RLSelectTheme.setup(props, {
    slots: ["leadingSlot"] as const,
    omit: OMIT_KEYS,
  });

  const normalizedItems = createMemo(() =>
    (props.items ?? []).map((item) =>
      typeof item === "string"
        ? { label: item, value: item, disabled: false }
        : {
            label: String(item.label ?? item.value ?? ""),
            value: String(item.value ?? ""),
            disabled: item.disabled === true,
          },
    ),
  );

  const leadingIconName = createMemo(() => props.leadingIcon ?? "");
  const showPlaceholder = createMemo(() => Boolean(props.placeholder) && !props.multiple);
  const iconLayout = createMemo(() => props.layout === "icon");

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
    if (Array.isArray(val)) return val.map(String).includes(optionValue);
    return val === undefined ? undefined : String(val) === optionValue;
  };

  const handleChange = (e: Event & { currentTarget: HTMLSelectElement }) => {
    setInternalValue(e.currentTarget.value);
    props.onChange?.(e);
  };

  return (
    <Tag class={classes().root} data-slot="root" data-theme={theme()}>
      <select
        id={id()}
        name={props.name}
        disabled={props.disabled}
        required={props.required}
        multiple={props.multiple}
        value={currentValueStr()}
        ref={props.ref}
        onBlur={props.onBlur}
        class={classes().select}
        data-slot="select"
        data-variant={iconLayout() ? "icon" : undefined}
        {...rest}
        onChange={handleChange}
      >
        {/* The select button. <selectedcontent> mirrors the chosen option, so the closed control shows its label. */}
        <RLButton
          variant="unstyled"
          shape="bare"
          justify={iconLayout() ? "center" : "start"}
          class={classes().trigger}
          data-slot="trigger"
        >
          <Show
            when={slots.leadingSlot()}
            fallback={
              <Show when={props.leadingIcon}>
                <span class={classes().leading} data-slot="leading">
                  <RLIcon
                    name={leadingIconName()}
                    size="sm"
                    class={classes().icon}
                    data-slot="icon"
                  />
                </span>
              </Show>
            }
          >
            <span class={classes().leading} data-slot="leading">
              {renderSlot(slots.leadingSlot())}
            </span>
          </Show>
          <selectedcontent class={classes().label} data-slot="label" />
          <RLIcon name="chevron-down" class={classes().chevron} data-slot="chevron" />
        </RLButton>

        <Show when={showPlaceholder()}>
          <option
            value=""
            disabled
            selected={!currentValue()}
            class={classes().option}
            data-slot="option"
          >
            {props.placeholder}
          </option>
        </Show>

        <Show
          when={children()}
          fallback={
            <For each={normalizedItems()}>
              {(item) => (
                <option
                  value={item.value}
                  disabled={item.disabled}
                  selected={isOptionSelected(item.value)}
                  class={classes().option}
                  data-slot="option"
                >
                  {item.label}
                </option>
              )}
            </For>
          }
        >
          {children()}
        </Show>
      </select>
    </Tag>
  );
};
