import type { RLInputProps } from "./input.types";
import { RLInputTheme } from "./input.theme";
import { createMemo, omit, children, type Component, Show } from "solid-js";
import { RLIcon } from "../icon/RLIcon";

export const RLInput: Component<RLInputProps> = (props) => {
  const rest = omit(
    props,
    "type",
    "value",
    "placeholder",
    "disabled",
    "readonly",
    "name",
    "required",
    "error",
    "leadingIcon",
    "trailingIcon",
    "variant",
    "size",
    "color",
    "theme",
    "ui",
    "class",
    "onInput",
    "onChange",
    "onBlur",
    "onFocus",
    "onKeyDown",
    "ref",
    "leading",
    "trailing",
  );

  const resolvedLeading = children(() => props.leading);
  const resolvedTrailing = children(() => props.trailing);

  const hasLeading = () => !!(props.leadingIcon || resolvedLeading());
  const hasTrailing = () => !!(props.trailingIcon || resolvedTrailing());

  const classes = createMemo(() =>
    RLInputTheme({
      variant: props.variant ?? "default",
      size: props.size ?? "md",
      hasLeading: hasLeading(),
      hasTrailing: hasTrailing(),
      error: !!props.error,
      ui: props.ui,
      class: props.class,
    }),
  );

  return (
    <div class={classes().root} data-slot="root" data-theme={props.theme}>
      <Show when={resolvedLeading()}>{resolvedLeading()}</Show>
      <Show when={!resolvedLeading() && props.leadingIcon}>
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

      <Show when={resolvedTrailing()}>{resolvedTrailing()}</Show>
      <Show when={!resolvedTrailing() && props.trailingIcon}>
        <span class={classes().trailing} data-slot="trailing">
          <RLIcon name={props.trailingIcon!} size="sm" aria-hidden="true" />
        </span>
      </Show>
    </div>
  );
};
