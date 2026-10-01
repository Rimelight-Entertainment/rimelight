import { createMemo, omit, children, type Component, Show } from "solid-js";
import type { JSX } from "@solidjs/web";
import type { InputProps } from "./input";
import { inputTheme } from "./input.theme";
import { RLIcon } from "../icon/RLIcon";

export interface RLInputProps extends InputProps {
  onInput?: (e: InputEvent & { currentTarget: HTMLInputElement }) => void;
  onChange?: (e: Event & { currentTarget: HTMLInputElement }) => void;
  onBlur?: (e: FocusEvent & { currentTarget: HTMLInputElement }) => void;
  onFocus?: (e: FocusEvent & { currentTarget: HTMLInputElement }) => void;
  onKeyDown?: (e: KeyboardEvent & { currentTarget: HTMLInputElement }) => void;
  ref?: HTMLInputElement | ((el: HTMLInputElement) => void);
  leading?: JSX.Element;
  trailing?: JSX.Element;
}

const RLInput: Component<RLInputProps> = (allProps) => {
  const props = allProps;
  const rest = omit(
    allProps,
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

  const resolvedClasses = createMemo(() =>
    inputTheme({
      variant: props.variant ?? "default",
      size: props.size ?? "md",
      hasLeading: hasLeading(),
      hasTrailing: hasTrailing(),
      error: !!props.error,
      theme: props.theme,
      ui: props.ui,
      class: props.class,
    }),
  );

  return (
    <div class={resolvedClasses().root} data-slot="root" data-theme={props.theme}>
      <Show when={resolvedLeading()}>{resolvedLeading()}</Show>
      <Show when={!resolvedLeading() && props.leadingIcon}>
        <span class={resolvedClasses().leading} data-slot="leading">
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
        class={resolvedClasses().input}
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
        <span class={resolvedClasses().trailing} data-slot="trailing">
          <RLIcon name={props.trailingIcon!} size="sm" aria-hidden="true" />
        </span>
      </Show>
    </div>
  );
};

export { RLInput };
