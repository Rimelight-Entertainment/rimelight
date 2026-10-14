import type { RLCheckboxProps } from "./checkbox.types";
import { RLCheckboxTheme } from "./checkbox.theme";
import { createMemo, createSignal, createUniqueId, omit, Show, type Component } from "solid-js";
import { dynamic } from "@solidjs/web";
import { RLIcon } from "../icon/RLIcon";

export const RLCheckbox: Component<RLCheckboxProps> = (allProps) => {
  const props = allProps;
  const generatedId = createUniqueId();
  const id = () => props.id || `rl-checkbox-${generatedId}`;

  const rest = omit(
    allProps,
    "as",
    "id",
    "checked",
    "disabled",
    "required",
    "name",
    "label",
    "description",
    "size",
    "color",
    "variant",
    "indicator",
    "highlight",
    "icon",
    "indeterminateIcon",
    "indeterminate",
    "theme",
    "ui",
    "class",
    "value",
    "defaultChecked",
    "onCheckedChange",
    "onChange",
    "labelSlot",
    "descriptionSlot",
    "children",
    "autofocus",
    "form",
    "formaction",
    "formenctype",
    "formmethod",
    "formnovalidate",
    "formtarget",
  );

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
  const variant = () => props.variant ?? "list";
  const indicator = () => props.indicator ?? "start";
  const highlight = () => Boolean(props.highlight);
  const disabled = () => Boolean(props.disabled);
  const required = () => Boolean(props.required);

  const labelIcon = () => (indicator() === "hidden" ? props.icon || "check" : undefined);
  const activeIcon = () =>
    isIndeterminate() ? props.indeterminateIcon || "minus" : props.icon || "check";

  const resolvedClasses = createMemo(() =>
    RLCheckboxTheme({
      color: color(),
      variant: variant(),
      size: size(),
      indicator: indicator(),
      highlight: highlight(),
      disabled: disabled(),
      required: required(),
      checked: isChecked() || isIndeterminate(),
      ui: props.ui,
      class: props.class,
    }),
  );

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

  const Root = dynamic(() => props.as ?? "label");

  const hasLabel = () => Boolean(props.label || props.labelSlot || props.children);
  const hasDescription = () => Boolean(props.description || props.descriptionSlot);
  const hasWrapper = () => Boolean(labelIcon() || hasLabel() || hasDescription());

  const renderLabel = () => {
    if (props.labelSlot) {
      if (typeof props.labelSlot === "function") {
        return (props.labelSlot as any)({ label: props.label });
      }
      return props.labelSlot;
    }
    if (props.children) {
      return props.children;
    }
    return props.label;
  };

  const renderDescription = () => {
    if (props.descriptionSlot) {
      if (typeof props.descriptionSlot === "function") {
        return (props.descriptionSlot as any)({ description: props.description });
      }
      return props.descriptionSlot;
    }
    return props.description;
  };

  return (
    <Root
      class={resolvedClasses().root}
      data-slot="root"
      data-theme={props.theme}
      data-state={checkState()}
      data-disabled={disabled() ? "true" : undefined}
    >
      <div class={resolvedClasses().container} data-slot="container">
        <input
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
          class={resolvedClasses().base}
          data-slot="base"
          data-state={checkState()}
          data-disabled={disabled() ? "true" : undefined}
        >
          <Show when={indicator() !== "hidden"}>
            <span
              class={resolvedClasses().indicator}
              data-slot="indicator"
              data-state={checkState()}
            >
              <RLIcon
                name={activeIcon()}
                size="none"
                class={resolvedClasses().icon}
                data-slot="icon"
                aria-hidden="true"
              />
            </span>
          </Show>
        </span>
      </div>

      <Show when={hasWrapper()}>
        <div class={resolvedClasses().wrapper} data-slot="wrapper">
          <Show when={labelIcon()}>
            <RLIcon
              name={labelIcon()!}
              size="none"
              class={resolvedClasses().icon}
              data-slot="icon"
              aria-hidden="true"
            />
          </Show>
          <Show when={hasLabel()}>
            <span class={resolvedClasses().label} data-slot="label">
              {renderLabel()}
            </span>
          </Show>
          <Show when={hasDescription()}>
            <p class={resolvedClasses().description} data-slot="description">
              {renderDescription()}
            </p>
          </Show>
        </div>
      </Show>
    </Root>
  );
};
