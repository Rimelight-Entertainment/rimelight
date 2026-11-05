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
    omit: [
      "value",
      "defaultValue",
      "onValueChange",
      "min",
      "max",
      "step",
      "name",
      "disabled",
      "aria-label",
      "aria-labelledby",
      "aria-describedby",
    ] as const,
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
    <Tag
      data-slot="root"
      data-theme={theme()}
      data-orientation={props.orientation ?? "horizontal"}
      data-disabled={props.disabled ? "" : undefined}
      class={classes().root}
      style={{ "--rl-slider-percent": `${percentage()}%` }}
      {...rest}
    >
      <div class={classes().track} data-slot="track">
        <div class={classes().range} data-slot="range" />
      </div>

      <input
        type="range"
        min={min()}
        max={max()}
        step={step()}
        value={value()}
        name={props.name}
        disabled={props.disabled}
        aria-label={props["aria-label"]}
        aria-labelledby={props["aria-labelledby"]}
        aria-describedby={props["aria-describedby"]}
        class={classes().input}
        data-slot="input"
        onInput={handleInput}
      />

      <div class={classes().thumb} data-slot="thumb" aria-hidden="true" />
    </Tag>
  );
};
