import type { RLInputDateProps } from "./input-date.types";
import { RLInputDateTheme } from "./input-date.theme";
import { createMemo, omit, type Component } from "solid-js";
import { RLInputTheme } from "../input/input.theme";

export const RLInputDate: Component<RLInputDateProps> = (props) => {
  const rest = omit(
    props,
    "children",
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
    "ui",
    "class",
    "onInput",
    "onChange",
    "onBlur",
    "onFocus",
    "onKeyDown",
  );

  const classes = createMemo(() =>
    RLInputDateTheme({
      ui: props.ui,
      class: props.class,
    }),
  );

  const inputClasses = createMemo(() =>
    RLInputTheme({
      variant: "default",
      size: props.size ?? "md",
      error: false,
      ui: props.ui,
    }),
  );

  return (
    <div class={`${classes().root} ${inputClasses().root}`} data-slot="root">
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
        class={inputClasses().input}
        data-slot="input"
        onInput={props.onInput}
        onChange={props.onChange}
        onBlur={props.onBlur}
        onFocus={props.onFocus}
        onKeyDown={props.onKeyDown}
        {...rest}
      />
      {props.children}
    </div>
  );
};
