import type { RLInputNumberProps } from "./input-number.types";
import { RLInputNumberTheme } from "./input-number.theme";
import { createMemo, type Component } from "solid-js";
import { RLInputTheme } from "../input/input.theme";
import { RLIcon } from "../icon/RLIcon";
import { RLButton } from "../button/RLButton";
import { createControllable } from "../../controllable";
import { uiT } from "../../locale";

const OMIT_KEYS = [
  "size",
  "value",
  "defaultValue",
  "min",
  "max",
  "step",
  "name",
  "placeholder",
  "disabled",
  "readonly",
  "required",
  "aria-label",
  "aria-labelledby",
  "aria-describedby",
  "onInput",
  "onBlur",
  "onFocus",
  "onKeyDown",
  "onValueChange",
] as const;

export const RLInputNumber: Component<RLInputNumberProps> = (props) => {
  const { Tag, classes, rest, children, theme } = RLInputNumberTheme.setup(props, {
    omit: OMIT_KEYS,
  });

  const inputUi = () => ({ root: classes().wrapper, input: classes().input });
  const inputClasses = createMemo(() => RLInputTheme({ size: props.size, ui: inputUi() }));

  const clamp = (value: number) =>
    Math.min(
      props.max ?? Number.POSITIVE_INFINITY,
      Math.max(props.min ?? Number.NEGATIVE_INFINITY, value),
    );

  const [current, setCurrent] = createControllable<number | undefined>(
    () => props.value,
    props.defaultValue,
    (next) => {
      if (next !== undefined) props.onValueChange?.(next);
    },
  );

  let inputRef: HTMLInputElement | undefined;

  const stepBy = (dir: 1 | -1) => {
    if (props.disabled || props.readonly) return;
    const raw = inputRef ? Number(inputRef.value) : Number(current());
    const base = Number.isNaN(raw) ? Number(current() || 0) : raw;
    const next = (Number.isNaN(base) ? 0 : base) + dir * (props.step ?? 1);
    setCurrent(clamp(next));
    if (inputRef) inputRef.value = String(clamp(next));
  };

  const commit = () => {
    const el = inputRef;
    if (!el) return;
    const raw = Number(el.value);
    if (el.value !== "" && !Number.isNaN(raw)) {
      const clamped = clamp(raw);
      if (clamped !== raw) el.value = String(clamped);
      setCurrent(clamped);
    }
  };

  const handleWheel = (e: WheelEvent) => {
    if (props.disabled || props.readonly) return;
    e.preventDefault();
    stepBy(e.deltaY < 0 ? 1 : -1);
  };

  const handleKeyDown = (e: KeyboardEvent & { currentTarget: HTMLInputElement }) => {
    props.onKeyDown?.(e);
    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault();
      stepBy(e.key === "ArrowUp" ? 1 : -1);
    } else if (e.key === "Enter") {
      e.preventDefault();
      commit();
    }
  };

  return (
    <Tag data-slot="root" data-theme={theme()} class={classes().root} {...rest}>
      <div class={inputClasses().root} data-slot="wrapper">
        <input
          ref={(el) => (inputRef = el)}
          type="number"
          name={props.name}
          value={current() ?? ""}
          placeholder={props.placeholder}
          min={props.min}
          max={props.max}
          step={props.step}
          disabled={props.disabled}
          readonly={props.readonly}
          required={props.required}
          aria-label={props["aria-label"]}
          aria-labelledby={props["aria-labelledby"]}
          aria-describedby={props["aria-describedby"]}
          class={inputClasses().input}
          data-slot="input"
          onInput={props.onInput}
          onBlur={commit}
          onFocus={props.onFocus}
          onKeyDown={handleKeyDown}
          onWheel={handleWheel}
        />
        <div class={classes().stepper} data-slot="stepper">
          <RLButton
            variant="ghost"
            color="neutral"
            size="xs"
            tabindex={-1}
            aria-label={uiT("input-number.increment")}
            class={classes().increment}
            data-slot="increment"
            disabled={props.disabled || props.readonly}
            onClick={() => stepBy(1)}
          >
            <RLIcon name="arrow-up" size="xs" aria-hidden="true" />
          </RLButton>
          <RLButton
            variant="ghost"
            color="neutral"
            size="xs"
            tabindex={-1}
            aria-label={uiT("input-number.decrement")}
            class={classes().decrement}
            data-slot="decrement"
            disabled={props.disabled || props.readonly}
            onClick={() => stepBy(-1)}
          >
            <RLIcon name="arrow-down" size="xs" aria-hidden="true" />
          </RLButton>
        </div>
      </div>
      {children()}
    </Tag>
  );
};
