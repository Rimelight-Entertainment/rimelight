import { createEffect, createMemo, createSignal, omit, type Component } from "solid-js";
import type { JSX } from "@solidjs/web";
import type { SliderProps } from "./slider";
import { sliderTheme } from "./slider.theme";

export interface RLSliderProps extends SliderProps {
  children?: JSX.Element;
  defaultValue?: number;
  onChange?: (val: number) => void;
}

const RLSlider: Component<RLSliderProps> = (allProps) => {
  const props = allProps;
  const rest = omit(
    allProps,
    "value",
    "defaultValue",
    "min",
    "max",
    "step",
    "name",
    "color",
    "theme",
    "ui",
    "class",
    "children",
    "onChange"
  );

  const min = () => props.min ?? 0;
  const max = () => props.max ?? 100;
  const step = () => props.step ?? 1;

  const [internalVal, setInternalVal] = createSignal(props.value ?? props.defaultValue ?? min());

  createEffect(
    () => props.value,
    (val) => {
      if (val !== undefined) {
        setInternalVal(val);
      }
    }
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

  const resolvedClasses = createMemo(() =>
    sliderTheme({
      color: props.color,
      ui: props.ui,
      class: props.class
    })
  );

  return (
    <div class={resolvedClasses().root} data-slot="slider-root" data-theme={props.theme} {...rest}>
      <div class={resolvedClasses().track} data-slot="track">
        <svg class="h-full w-full overflow-visible pointer-events-none">
          <rect
            class={`${resolvedClasses().range} h-full`}
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
          class={`${resolvedClasses().thumb} pointer-events-auto border-none`}
          data-slot="thumb"
          fill="currentColor"
        />
      </svg>
    </div>
  );
};

export { RLSlider };
