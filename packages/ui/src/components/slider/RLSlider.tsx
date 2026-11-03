import type { RLSliderProps } from "./slider.types";
import { RLSliderTheme } from "./slider.theme";
import { createMemo, type Component } from "solid-js";
import type { JSX } from "@solidjs/web";
import { createControllable } from "../../controllable";

export const RLSlider: Component<RLSliderProps> = (props) => {
  const min = () => props.min ?? 0;
  const max = () => props.max ?? 100;
  const step = () => props.step ?? 1;

  const [value, setValue] = createControllable<number>(
    () => props.value,
    props.defaultValue ?? min(),
    (next) => props.onValueChange?.(next),
  );

  const { Tag, classes, rest, theme } = RLSliderTheme.setup(props, {
    omit: ["value", "defaultValue", "onValueChange", "min", "max", "step", "name"] as const,
  });

  const percentage = createMemo(() => {
    const v = value();
    const mn = min();
    const mx = max();
    return Math.min(100, Math.max(0, ((v - mn) / (mx - mn)) * 100));
  });

  const handleInput: JSX.EventHandler<HTMLInputElement, InputEvent> = (e) => {
    const num = parseFloat(e.currentTarget.value);
    if (!isNaN(num)) setValue(num);
  };

  return (
    <Tag data-slot="root" data-theme={theme()} class={classes().root} {...rest}>
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
        value={value()}
        name={props.name}
        class={classes().input}
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
    </Tag>
  );
};
