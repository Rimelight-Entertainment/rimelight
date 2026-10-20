import type { Component } from "solid-js";
import type { RLTextareaProps } from "./textarea.types";
import { RLTextareaTheme } from "./textarea.theme";

const OMIT_KEYS = [
  "value",
  "placeholder",
  "disabled",
  "readonly",
  "name",
  "required",
  "rows",
  "autoGrow",
  "color",
  "onInput",
  "onChange",
  "onBlur",
  "onFocus",
  "onKeyDown",
  "ref",
] as const;

export const RLTextarea: Component<RLTextareaProps> = (props) => {
  const { classes, rest } = RLTextareaTheme.setup(props, {
    omit: OMIT_KEYS,
    variants: () => ({ error: !!props.error }),
  });

  return (
    <div class={classes().root} data-slot="root">
      <textarea
        ref={props.ref}
        name={props.name}
        rows={props.autoGrow ? undefined : (props.rows ?? 4)}
        style={props.autoGrow ? "field-sizing: content; min-height: unset;" : undefined}
        value={props.value !== undefined ? props.value : ""}
        placeholder={props.placeholder}
        disabled={props.disabled}
        readonly={props.readonly}
        required={props.required}
        class={classes().textarea}
        data-slot="textarea"
        onInput={props.onInput}
        onChange={props.onChange}
        onBlur={props.onBlur}
        onFocus={props.onFocus}
        onKeyDown={props.onKeyDown}
        {...rest}
      />
    </div>
  );
};
