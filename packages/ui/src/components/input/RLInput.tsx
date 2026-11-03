import type { Component } from "solid-js";
import type { RLInputProps } from "./input.types";
import { RLInputTheme } from "./input.theme";
import { Show } from "solid-js";
import { RLIcon } from "../icon/RLIcon";

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
      <Show when={slots.leadingSlot()}>{slots.leadingSlot()}</Show>
      <Show when={!slots.leadingSlot() && props.leadingIcon}>
        <span class={classes().leading} data-slot="leading">
          <RLIcon name={props.leadingIcon!} size="sm" aria-hidden="true" />
        </span>
      </Show>

      <input
        ref={props.ref}
        type={props.type}
        name={props.name}
        value={props.value !== undefined ? props.value : ""}
        placeholder={props.placeholder}
        disabled={props.disabled}
        readonly={props.readonly}
        required={props.required}
        class={classes().input}
        data-slot="input"
        onInput={props.onInput}
        onChange={props.onChange}
        onBlur={props.onBlur}
        onFocus={props.onFocus}
        onKeyDown={props.onKeyDown}
        {...rest}
      />

      <Show when={slots.trailingSlot()}>{slots.trailingSlot()}</Show>
      <Show when={!slots.trailingSlot() && props.trailingIcon}>
        <span class={classes().trailing} data-slot="trailing">
          <RLIcon name={props.trailingIcon!} size="sm" aria-hidden="true" />
        </span>
      </Show>
      {children()}
    </Tag>
  );
};
