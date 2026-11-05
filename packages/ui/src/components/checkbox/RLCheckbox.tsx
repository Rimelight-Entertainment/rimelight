import type { RLCheckboxProps } from "./checkbox.types";
import { RLCheckboxTheme } from "./checkbox.theme";
import { createSignal, Show, type Component } from "solid-js";
import { RLIcon } from "../icon/RLIcon";
import { renderSlot } from "../../slot";

const OMIT_KEYS = [
  "checked",
  "id",
  "name",
  "label",
  "description",
  "icon",
  "indeterminateIcon",
  "indeterminate",
  "value",
  "defaultChecked",
  "onCheckedChange",
  "onChange",
  "ref",
  "autofocus",
  "form",
  "formaction",
  "formenctype",
  "formmethod",
  "formnovalidate",
  "formtarget",
] as const;

export const RLCheckbox: Component<RLCheckboxProps> = (props) => {
  const [internalChecked, setInternalChecked] = createSignal<boolean | "indeterminate">(
    props.defaultChecked ?? false,
  );

  const isIndeterminate = () => {
    if (props.indeterminate === true) return true;
    if (props.checked !== undefined) return props.checked === "indeterminate";
    return internalChecked() === "indeterminate";
  };

  const isChecked = () => {
    if (isIndeterminate()) return false;
    if (props.checked !== undefined) return props.checked === true;
    return internalChecked() === true;
  };

  const checkState = () => {
    if (isIndeterminate()) return "indeterminate";
    return isChecked() ? "checked" : "unchecked";
  };

  const size = () => props.size ?? "md";
  const color = () => props.color ?? "primary";
  const side = () => props.side ?? "start";
  const hasIndicator = () => props.hasIndicator ?? true;
  const highlight = () => Boolean(props.highlight);
  const disabled = () => Boolean(props.disabled);
  const required = () => Boolean(props.required);

  const activeIcon = () =>
    isIndeterminate() ? (props.indeterminateIcon ?? "minus") : (props.icon ?? "check");

  const { Tag, classes, rest, id, slots, children, theme } = RLCheckboxTheme.setup(props, {
    slots: ["labelSlot", "descriptionSlot"] as const,
    as: "label",
    omit: OMIT_KEYS,
    variants: () => ({
      color: color(),
      size: size(),
      side: side(),
      hasIndicator: hasIndicator(),
      highlight: highlight(),
      checked: isChecked() || isIndeterminate(),
    }),
  });

  const handleChange = (e: Event & { currentTarget: HTMLInputElement }) => {
    if (disabled()) return;

    const next = e.currentTarget.checked;
    if (props.checked === undefined) {
      setInternalChecked(next);
    }
    props.onCheckedChange?.(next);
    props.onChange?.(e);
  };

  const hasLabel = () => Boolean(props.label || slots.labelSlot() || children());
  const hasDescription = () => Boolean(props.description || slots.descriptionSlot());
  const hasWrapper = () => !hasIndicator() || hasLabel() || hasDescription();

  return (
    <Tag
      class={classes().root}
      data-slot="root"
      data-theme={theme()}
      data-state={checkState()}
      data-disabled={disabled() ? "" : undefined}
    >
      <div class={classes().container} data-slot="container">
        <input
          ref={props.ref}
          id={id()}
          type="checkbox"
          name={props.name}
          value={props.value ?? "on"}
          checked={isChecked()}
          disabled={disabled()}
          required={required()}
          autofocus={props.autofocus === true || props.autofocus === "true"}
          form={props.form}
          formaction={props.formaction}
          formenctype={props.formenctype}
          formmethod={props.formmethod}
          formnovalidate={props.formnovalidate === true || props.formnovalidate === "true"}
          formtarget={props.formtarget}
          aria-checked={isIndeterminate() ? "mixed" : isChecked() ? "true" : "false"}
          aria-required={required() ? "true" : undefined}
          aria-disabled={disabled() ? "true" : undefined}
          onChange={handleChange}
          class={classes().input}
          {...rest}
        />

        <span
          class={classes().base}
          data-slot="base"
          data-state={checkState()}
          data-disabled={disabled() ? "" : undefined}
        >
          <Show when={hasIndicator()}>
            <span class={classes().indicator} data-slot="indicator" data-state={checkState()}>
              <RLIcon
                name={activeIcon()}
                class={classes().icon}
                data-slot="icon"
                aria-hidden="true"
              />
            </span>
          </Show>
        </span>
      </div>

      <Show when={hasWrapper()}>
        <div class={classes().wrapper} data-slot="wrapper">
          <Show when={!hasIndicator()}>
            <RLIcon
              name={props.icon ?? "check"}
              class={classes().icon}
              data-slot="icon"
              aria-hidden="true"
            />
          </Show>
          <Show when={hasLabel()}>
            <span class={classes().label} data-slot="label">
              <Show
                when={slots.labelSlot()}
                fallback={
                  <Show when={children()} fallback={props.label}>
                    {children()}
                  </Show>
                }
              >
                {renderSlot(slots.labelSlot(), { label: props.label })}
              </Show>
            </span>
          </Show>
          <Show when={hasDescription()}>
            <p class={classes().description} data-slot="description">
              <Show when={slots.descriptionSlot()} fallback={props.description}>
                {renderSlot(slots.descriptionSlot(), { description: props.description })}
              </Show>
            </p>
          </Show>
        </div>
      </Show>
    </Tag>
  );
};
