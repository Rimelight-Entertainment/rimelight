import type { RLInputNumberProps } from "./input-number.types";
import { RLInputNumberTheme } from "./input-number.theme";
import { createMemo, createSignal, type Component } from "solid-js";
import { RLInputTheme } from "../input/input.theme";
import { RLIcon } from "../icon/RLIcon";
import { uiT } from "../../locale";

const OMIT_KEYS = [
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
  "size",
  "onInput",
  "onChange",
  "onBlur",
  "onFocus",
  "onKeyDown",
  "onValueChange",
] as const;

export const RLInputNumber: Component<RLInputNumberProps> = (props) => {
  const { classes, rest } = RLInputNumberTheme.setup(props, { omit: OMIT_KEYS });

  const inputClasses = createMemo(() =>
    RLInputTheme({
      variant: "default",
      size: props.size ?? "md",
      error: false,
      ui: props.ui,
    }),
  );

  const clamp = (value: number) =>
    Math.min(
      props.max ?? Number.POSITIVE_INFINITY,
      Math.max(props.min ?? Number.NEGATIVE_INFINITY, value),
    );

  const [internalValue, setInternalValue] = createSignal<number | undefined>(props.defaultValue);
  const boundValue = () => (props.value !== undefined ? props.value : internalValue());

  let inputRef: HTMLInputElement | undefined;

  const updateValue = (next: number) => {
    const clamped = clamp(next);
    if (props.value === undefined) setInternalValue(clamped);
    props.onValueChange?.(clamped);
  };

  const stepBy = (dir: 1 | -1) => {
    if (props.disabled || props.readonly) return;
    const raw = inputRef ? Number(inputRef.value) : Number(boundValue());
    const base = Number.isNaN(raw) ? Number(boundValue() || 0) : raw;
    updateValue((Number.isNaN(base) ? 0 : base) + dir * (props.step ?? 1));
    if (inputRef)
      inputRef.value = String(clamp((Number.isNaN(base) ? 0 : base) + dir * (props.step ?? 1)));
  };

  const changeEvent = (el: HTMLInputElement): Event & { currentTarget: HTMLInputElement } => {
    const ev = new Event("change", { bubbles: true });
    Object.defineProperty(ev, "currentTarget", { value: el });
    return ev as Event & { currentTarget: HTMLInputElement };
  };

  const commit = () => {
    const el = inputRef;
    if (!el) return;
    const raw = Number(el.value);
    if (el.value !== "" && !Number.isNaN(raw)) {
      const clamped = clamp(raw);
      if (props.value === undefined) setInternalValue(clamped);
      if (clamped !== raw) el.value = String(clamped);
      props.onValueChange?.(clamped);
    }
    props.onChange?.(changeEvent(el));
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
    <div class={classes().root} data-slot="root" {...rest}>
      <div class={`relative w-full ${inputClasses().root}`}>
        <input
          ref={(el) => (inputRef = el)}
          type="number"
          name={props.name}
          value={props.value !== undefined ? props.value : ""}
          placeholder={props.placeholder}
          min={props.min}
          max={props.max}
          step={props.step}
          disabled={props.disabled}
          readonly={props.readonly}
          required={props.required}
          class={`${inputClasses().input} pr-11 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
          data-slot="input"
          onInput={props.onInput}
          onChange={props.onChange}
          onBlur={commit}
          onFocus={props.onFocus}
          onKeyDown={handleKeyDown}
          onWheel={handleWheel}
        />
        <div class="absolute right-1 top-1/2 flex -translate-y-1/2 flex-col">
          <button
            type="button"
            tabindex={-1}
            aria-label={uiT("input-number.increment")}
            class="flex size-6 items-center justify-center rounded-sm text-muted hover:bg-muted/60 hover:text-highlighted disabled:cursor-not-allowed disabled:opacity-50"
            data-slot="increment"
            disabled={props.disabled || props.readonly}
            onClick={() => stepBy(1)}
          >
            <RLIcon name="arrow-up" size="xs" aria-hidden="true" />
          </button>
          <button
            type="button"
            tabindex={-1}
            aria-label={uiT("input-number.decrement")}
            class="flex size-6 items-center justify-center rounded-sm text-muted hover:bg-muted/60 hover:text-highlighted disabled:cursor-not-allowed disabled:opacity-50"
            data-slot="decrement"
            disabled={props.disabled || props.readonly}
            onClick={() => stepBy(-1)}
          >
            <RLIcon name="arrow-down" size="xs" aria-hidden="true" />
          </button>
        </div>
      </div>
      {props.children}
    </div>
  );
};
