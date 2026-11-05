import type { Component } from "solid-js";
import type { RLInputProps } from "./input.types";
import { RLInputTheme } from "./input.theme";
import { Show } from "solid-js";
import { RLIcon } from "../icon/RLIcon";
import { renderSlot } from "../../slot";

const OMIT_KEYS = [
  "type",
  "value",
  "placeholder",
  "disabled",
  "readonly",
  "name",
  "required",
  "leadingIcon",
  "trailingIcon",
  "onInput",
  "onChange",
  "onBlur",
  "onFocus",
  "onKeyDown",
  "ref",
] as const;

export const RLInput: Component<RLInputProps> = (props) => {
  const { Tag, classes, rest, slots, children, theme } = RLInputTheme.setup(props, {
    slots: ["leadingSlot", "trailingSlot"] as const,
    omit: OMIT_KEYS,
    variants: (s) => ({
      hasLeading: !!(props.leadingIcon || s.leadingSlot()),
      hasTrailing: !!(props.trailingIcon || s.trailingSlot()),
    }),
  });

  return (
    <Tag data-slot="root" data-theme={theme()} class={classes().root}>
      <Show when={slots.leadingSlot()}>{renderSlot(slots.leadingSlot())}</Show>
      <Show when={slots.leadingSlot() ? undefined : props.leadingIcon}>
        {(icon) => (
          <span class={classes().leading} data-slot="leading">
            <RLIcon name={icon()} size="sm" aria-hidden="true" />
          </span>
        )}
      </Show>

      <input
        ref={props.ref}
        type={props.type}
        name={props.name}
        value={props.value ?? ""}
        placeholder={props.placeholder}
        disabled={props.disabled}
        readonly={props.readonly}
        required={props.required}
        aria-invalid={props.invalid ? "true" : undefined}
        class={classes().input}
        data-slot="input"
        onInput={props.onInput}
        onChange={props.onChange}
        onBlur={props.onBlur}
        onFocus={props.onFocus}
        onKeyDown={props.onKeyDown}
        {...rest}
      />

      <Show when={slots.trailingSlot()}>{renderSlot(slots.trailingSlot())}</Show>
      <Show when={slots.trailingSlot() ? undefined : props.trailingIcon}>
        {(icon) => (
          <span class={classes().trailing} data-slot="trailing">
            <RLIcon name={icon()} size="sm" aria-hidden="true" />
          </span>
        )}
      </Show>
      {children()}
    </Tag>
  );
};
