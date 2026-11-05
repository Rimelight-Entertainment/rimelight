import type { Component } from "solid-js";
import type { RLInputTimeProps } from "./input-time.types";
import { RLInputTimeTheme } from "./input-time.theme";
import { createMemo } from "solid-js";
import { RLInputTheme } from "../input/input.theme";

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
  "size",
  "onInput",
  "onValueChange",
  "onBlur",
  "onFocus",
  "onKeyDown",
  "ref",
] as const;

export const RLInputTime: Component<RLInputTimeProps> = (props) => {
  const { Tag, classes, rest, children, theme } = RLInputTimeTheme.setup(props, {
    omit: OMIT_KEYS,
  });

  const inputUi = () => ({ root: classes().root, input: classes().input });
  const inputClasses = createMemo(() => RLInputTheme({ size: props.size, ui: inputUi() }));

  return (
    <Tag data-slot="root" data-theme={theme()} class={inputClasses().root}>
      <input
        type="time"
        name={props.name}
        value={props.value ?? props.defaultValue ?? ""}
        placeholder={props.placeholder}
        disabled={props.disabled}
        readonly={props.readonly}
        required={props.required}
        min={props.min}
        max={props.max}
        step={props.step}
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
