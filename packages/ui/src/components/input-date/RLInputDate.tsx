import type { Component } from "solid-js";
import type { RLInputDateProps } from "./input-date.types";
import { RLInputDateTheme } from "./input-date.theme";
import { createMemo } from "solid-js";
import { RLInputTheme } from "../input/input.theme";
import { cx } from "../../resolver";

const OMIT_KEYS = [
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
  "onInput",
  "onValueChange",
  "onBlur",
  "onFocus",
  "onKeyDown",
  "ref",
] as const;

export const RLInputDate: Component<RLInputDateProps> = (props) => {
  const { Tag, classes, rest, children, theme, ui } = RLInputDateTheme.setup(props, {
    omit: OMIT_KEYS,
  });

  const inputClasses = createMemo(() => RLInputTheme({ size: props.size, ui: ui() }));

  return (
    <Tag data-slot="root" data-theme={theme()} class={cx(classes().root, inputClasses().root)}>
      <input
        type="date"
        name={props.name}
        value={props.value !== undefined ? props.value : (props.defaultValue ?? "")}
        placeholder={props.placeholder}
        disabled={props.disabled}
        readonly={props.readonly}
        required={props.required}
        min={props.min}
        max={props.max}
        step={props.step}
        class={cx(inputClasses().input, classes().input)}
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
