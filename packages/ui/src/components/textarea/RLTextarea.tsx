import type { Component } from "solid-js";
import type { RLTextareaProps } from "./textarea.types";
import { RLTextareaTheme } from "./textarea.theme";
import { createControllable } from "../../controllable";

export const RLTextarea: Component<RLTextareaProps> = (props) => {
  const [value, setValue] = createControllable<string>(
    () => props.value,
    props.defaultValue ?? "",
    (next) => props.onValueChange?.(next),
  );

  const { Tag, classes, rest, theme } = RLTextareaTheme.setup(props, {
    omit: [
      "value",
      "defaultValue",
      "onValueChange",
      "placeholder",
      "disabled",
      "readonly",
      "name",
      "required",
      "rows",
      "autoGrow",
      "onInput",
      "onChange",
      "onBlur",
      "onFocus",
      "onKeyDown",
      "ref",
    ] as const,
  });

  return (
    <Tag data-slot="root" data-theme={theme()} class={classes().root}>
      <textarea
        ref={props.ref}
        name={props.name}
        rows={props.autoGrow ? undefined : (props.rows ?? 4)}
        style={props.autoGrow ? "field-sizing: content; min-height: unset;" : undefined}
        value={value()}
        placeholder={props.placeholder}
        disabled={props.disabled}
        readonly={props.readonly}
        required={props.required}
        class={classes().textarea}
        data-slot="textarea"
        onInput={(event) => {
          setValue(event.currentTarget.value);
          props.onInput?.(event);
        }}
        onChange={props.onChange}
        onBlur={props.onBlur}
        onFocus={props.onFocus}
        onKeyDown={props.onKeyDown}
        {...rest}
      />
    </Tag>
  );
};
