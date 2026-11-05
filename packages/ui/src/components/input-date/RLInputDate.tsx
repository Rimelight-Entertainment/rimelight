import type { Component } from "solid-js";
import type { RLInputDateProps } from "./input-date.types";
import { RLInputDateTheme } from "./input-date.theme";
import { createMemo } from "solid-js";
import { RLInputTheme } from "../input/input.theme";

const OMIT_KEYS = [
  "size",
  "value",
  "defaultValue",
  "name",
  "placeholder",
  "disabled",
  "readonly",
  "required",
  "min",
  "max",
  "step",
  "aria-label",
  "aria-labelledby",
  "aria-describedby",
  "onInput",
  "onValueChange",
  "onBlur",
  "onFocus",
  "onKeyDown",
  "ref",
] as const;

export const RLInputDate: Component<RLInputDateProps> = (props) => {
  const { Tag, classes, rest, children, theme } = RLInputDateTheme.setup(props, {
    omit: OMIT_KEYS,
  });

  const inputUi = () => ({ root: classes().root, input: classes().input });
  const inputClasses = createMemo(() => RLInputTheme({ size: props.size, ui: inputUi() }));

  return (
    <Tag data-slot="root" data-theme={theme()} class={inputClasses().root}>
      <input
        type="date"
        name={props.name}
        value={props.value ?? props.defaultValue ?? ""}
        placeholder={props.placeholder}
        disabled={props.disabled}
        readonly={props.readonly}
        required={props.required}
        min={props.min}
        max={props.max}
        step={props.step}
        aria-label={props["aria-label"]}
        aria-labelledby={props["aria-labelledby"]}
        aria-describedby={props["aria-describedby"]}
        class={inputClasses().input}
        data-slot="input"
        onInput={props.onInput}
        onBlur={props.onBlur}
        onFocus={props.onFocus}
        onKeyDown={props.onKeyDown}
        ref={props.ref}
        {...rest}
        onChange={(e) => props.onValueChange?.(e.currentTarget.value)}
      />
      {children()}
    </Tag>
  );
};
