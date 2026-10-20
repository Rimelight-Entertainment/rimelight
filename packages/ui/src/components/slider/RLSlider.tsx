import type { RLSliderProps } from "./slider.types";
import { RLSliderTheme } from "./slider.theme";
import { createMemo, createSignal, type Component } from "solid-js";
import type { JSX } from "@solidjs/web";

const OMIT_KEYS = ["value", "defaultValue", "min", "max", "step", "name", "onChange"] as const;

export const RLSlider: Component<RLSliderProps> = (props) => {
  const { classes, rest } = RLSliderTheme.setup(props, { omit: OMIT_KEYS });

  const min = () => props.min ?? 0;
  const max = () => props.max ?? 100;
  const step = () => props.step ?? 1;

  const [internalVal, setInternalVal] = createSignal(
    () => props.value ?? props.defaultValue ?? min(),
  );

  const currentVal = () => (props.value !== undefined ? props.value : internalVal());

  const percentage = createMemo(() => {
    const v = currentVal();
    const mn = min();
    const mx = max();
    return Math.min(100, Math.max(0, ((v - mn) / (mx - mn)) * 100));
  });

  const handleInput: JSX.EventHandler<HTMLInputElement, InputEvent> = (e) => {
    const num = parseFloat(e.currentTarget.value);
    if (!isNaN(num)) {
      if (props.value === undefined) {
        setInternalVal(num);
      }
      props.onChange?.(num);
    }
  };

  return (
    <div class={classes().root} data-slot="slider-root" data-theme={props.theme} {...rest}>
      <div class={classes().track} data-slot="track">
        <svg class="h-full w-full overflow-visible pointer-events-none">
          <rect
            class={`${classes().range} h-full`}
            width={`${percentage()}%`}
            fill="currentColor"
            rx="2"
          />
        </svg>
      </div>

      <input
        type="range"
        min={min()}
        max={max()}
        step={step()}
        value={currentVal()}
        name={props.name}
        class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        data-slot="input"
        onInput={handleInput}
      />

      <svg class="absolute inset-0 h-full w-full overflow-visible pointer-events-none">
        <circle
          cx={`${percentage()}%`}
          cy="50%"
          r="8"
          class={`${classes().thumb} pointer-events-auto border-none`}
          data-slot="thumb"
          fill="currentColor"
        />
      </svg>
    </div>
  );
};
