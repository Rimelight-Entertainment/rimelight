import type { RLCheckboxProps } from "./checkbox.types";
import { RLCheckboxTheme } from "./checkbox.theme";
import { createSignal, Show, type Component } from "solid-js";
import { RLIcon } from "../icon/RLIcon";

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
  // Uncontrolled state fallback
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
  const indicator = () => props.indicator ?? "start";
  const highlight = () => Boolean(props.highlight);
  const disabled = () => Boolean(props.disabled);
  const required = () => Boolean(props.required);

  const labelIcon = () => (indicator() === "hidden" ? props.icon || "check" : undefined);
  const activeIcon = () =>
    isIndeterminate() ? props.indeterminateIcon || "minus" : props.icon || "check";

  const { Tag, classes, rest, id, slots, children, theme } = RLCheckboxTheme.setup(props, {
    slots: ["labelSlot", "descriptionSlot"] as const,
    as: "label",
    omit: OMIT_KEYS,
    idPrefix: "rl-checkbox",
    variants: () => ({
      color: color(),
      layout: props.layout,
      size: size(),
      indicator: indicator(),
      highlight: highlight(),
      disabled: disabled(),
      required: required(),
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
    if (props.onChange) {
      props.onChange(e);
    }
  };

  const hasLabel = () => Boolean(props.label || slots.labelSlot() || children());
  const hasDescription = () => Boolean(props.description || slots.descriptionSlot());
  const hasWrapper = () => Boolean(labelIcon() || hasLabel() || hasDescription());

  const renderLabel = () => {
    if (slots.labelSlot()) {
      if (typeof slots.labelSlot() === "function") {
        return (slots.labelSlot() as any)({ label: props.label });
      }
      return slots.labelSlot();
    }
    if (children()) {
      return children();
    }
    return props.label;
  };

  const renderDescription = () => {
    if (slots.descriptionSlot()) {
      if (typeof slots.descriptionSlot() === "function") {
        return (slots.descriptionSlot() as any)({ description: props.description });
      }
      return slots.descriptionSlot();
    }
    return props.description;
  };

  return (
    <Tag
      class={classes().root}
      data-slot="root"
      data-theme={theme()}
      data-state={checkState()}
      data-disabled={disabled() ? "true" : undefined}
    >
      <div class={classes().container} data-slot="container">
        <input
          ref={props.ref}
          id={id()}
          type="checkbox"
          name={props.name}
          value={props.value !== undefined ? props.value : "on"}
          checked={isChecked()}
          disabled={disabled()}
          required={required()}
          autofocus={props.autofocus === true || props.autofocus === "true"}
          form={props.form}
          formaction={props.formaction}
          formenctype={props.formenctype as any}
          formmethod={props.formmethod as any}
          formnovalidate={props.formnovalidate === true || props.formnovalidate === "true"}
          formtarget={props.formtarget}
          aria-checked={isIndeterminate() ? "mixed" : isChecked() ? "true" : "false"}
          aria-required={required() ? "true" : undefined}
          aria-disabled={disabled() ? "true" : undefined}
          onChange={handleChange}
          class="sr-only peer"
          {...rest}
        />

        <span
          class={classes().base}
          data-slot="base"
          data-state={checkState()}
          data-disabled={disabled() ? "true" : undefined}
        >
          <Show when={indicator() !== "hidden"}>
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
          <Show when={labelIcon()}>
            <RLIcon
              name={labelIcon()!}
              class={classes().icon}
              data-slot="icon"
              aria-hidden="true"
            />
          </Show>
          <Show when={hasLabel()}>
            <span class={classes().label} data-slot="label">
              {renderLabel()}
            </span>
          </Show>
          <Show when={hasDescription()}>
            <p class={classes().description} data-slot="description">
              {renderDescription()}
            </p>
          </Show>
        </div>
      </Show>
    </Tag>
  );
};
