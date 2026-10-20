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
  "color",
  "theme",
  "onInput",
  "onChange",
  "onBlur",
  "onFocus",
  "onKeyDown",
  "ref",
  "leading",
  "trailing",
] as const;

export const RLInput: Component<RLInputProps> = (props) => {
  const hasLeading = () => !!(props.leadingIcon || props.leading);
  const hasTrailing = () => !!(props.trailingIcon || props.trailing);

  const { classes, rest } = RLInputTheme.setup(props, {
    omit: OMIT_KEYS,
    variants: () => ({
      variant: props.variant ?? "default",
      size: props.size ?? "md",
      hasLeading: hasLeading(),
      hasTrailing: hasTrailing(),
      error: !!props.error,
    }),
  });

  return (
    <div class={classes().root} data-slot="root" data-theme={props.theme}>
      <Show when={props.leading}>{props.leading}</Show>
      <Show when={!props.leading && props.leadingIcon}>
        <span class={classes().leading} data-slot="leading">
          <RLIcon name={props.leadingIcon!} size="sm" aria-hidden="true" />
        </span>
      </Show>

      <input
        ref={props.ref}
        type={props.type || "text"}
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

      <Show when={props.trailing}>{props.trailing}</Show>
      <Show when={!props.trailing && props.trailingIcon}>
        <span class={classes().trailing} data-slot="trailing">
          <RLIcon name={props.trailingIcon!} size="sm" aria-hidden="true" />
        </span>
      </Show>
    </div>
  );
};
