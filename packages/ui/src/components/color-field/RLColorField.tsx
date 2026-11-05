import type { RLColorFieldProps } from "./color-field.types";
import { COLOR_FIELD_DEFAULTS, RLColorFieldTheme } from "./color-field.theme";
import { createSignal, Show, type Component } from "solid-js";
import type { JSX } from "@solidjs/web";
import { createControllable } from "../../controllable";
import {
  clamp,
  getChannelRange,
  hexToRgb,
  hslToRgb,
  hsbToRgb,
  rgbToHex,
  rgbToHsb,
  rgbToHsl,
} from "../color-picker/color";

const OMIT_KEYS = [
  "channel",
  "colorSpace",
  "defaultValue",
  "disabled",
  "disableWheelChange",
  "value",
  "name",
  "placeholder",
  "readonly",
  "required",
  "step",
  "onValueChange",
] as const;

export const RLColorField: Component<RLColorFieldProps> = (props) => {
  const { Tag, classes, rest, children, theme } = RLColorFieldTheme.setup(props, {
    omit: OMIT_KEYS,
  });

  const colorSpace = () => props.colorSpace ?? COLOR_FIELD_DEFAULTS.colorSpace;

  const [currentHex, setCurrentHex] = createControllable(
    () => props.value,
    props.defaultValue ?? COLOR_FIELD_DEFAULTS.defaultValue,
    (next) => props.onValueChange?.(next),
  );

  const getDisplayValue = () => {
    const hex = currentHex();
    if (!props.channel) return hex;

    const rgb = hexToRgb(hex);
    if (colorSpace() === "hsl") {
      const hsl = rgbToHsl(rgb[0], rgb[1], rgb[2]);
      const index = ["hue", "saturation", "lightness"].indexOf(props.channel);
      return index !== -1 ? String(hsl[index]!) : "0";
    } else if (colorSpace() === "hsb") {
      const hsb = rgbToHsb(rgb[0], rgb[1], rgb[2]);
      const index = ["hue", "saturation", "brightness"].indexOf(props.channel);
      return index !== -1 ? String(hsb[index]!) : "0";
    } else if (colorSpace() === "rgb") {
      const index = ["red", "green", "blue"].indexOf(props.channel);
      return index !== -1 ? String(rgb[index]!) : "0";
    }
    return "0";
  };

  const [displayValue, setDisplayValue] = createSignal(getDisplayValue);

  const updateFromChannelValue = (val: number) => {
    if (!props.channel) return;
    const range = getChannelRange(props.channel);
    const clampedVal = clamp(val, range.min, range.max);

    const rgb = hexToRgb(currentHex());
    const hsl = rgbToHsl(rgb[0], rgb[1], rgb[2]);
    const hsb = rgbToHsb(rgb[0], rgb[1], rgb[2]);
    let newRgb = [...rgb] as [number, number, number];

    if (colorSpace() === "hsl") {
      const index = ["hue", "saturation", "lightness"].indexOf(props.channel);
      if (index !== -1) hsl[index] = clampedVal;
      newRgb = hslToRgb(hsl[0], hsl[1], hsl[2]);
    } else if (colorSpace() === "hsb") {
      const index = ["hue", "saturation", "brightness"].indexOf(props.channel);
      if (index !== -1) hsb[index] = clampedVal;
      newRgb = hsbToRgb(hsb[0], hsb[1], hsb[2]);
    } else if (colorSpace() === "rgb") {
      const index = ["red", "green", "blue"].indexOf(props.channel);
      if (index !== -1) newRgb[index] = clampedVal;
    }

    setCurrentHex(rgbToHex(newRgb[0], newRgb[1], newRgb[2]));
  };

  const handleInputChange: JSX.EventHandler<HTMLInputElement, InputEvent> = (e) => {
    if (props.disabled || props.readonly) return;
    const raw = e.currentTarget.value.trim();
    setDisplayValue(raw);

    if (!props.channel) {
      if (/^#[0-9A-F]{6}$/i.test(raw)) {
        setCurrentHex(raw);
      }
    } else {
      const num = parseFloat(raw);
      if (!isNaN(num)) {
        updateFromChannelValue(num);
      }
    }
  };

  const handleKeyDown: JSX.EventHandler<HTMLInputElement, KeyboardEvent> = (e) => {
    if (props.disabled || props.readonly) return;
    const stepSize = (e.shiftKey ? 10 : 1) * (props.step ?? COLOR_FIELD_DEFAULTS.step);

    if (props.channel) {
      const currentVal = parseFloat(displayValue()) || 0;
      let handled = false;
      let newVal = currentVal;

      if (e.key === "ArrowUp") {
        newVal = currentVal + stepSize;
        handled = true;
      } else if (e.key === "ArrowDown") {
        newVal = currentVal - stepSize;
        handled = true;
      } else if (e.key === "PageUp") {
        newVal = currentVal + stepSize * 10;
        handled = true;
      } else if (e.key === "PageDown") {
        newVal = currentVal - stepSize * 10;
        handled = true;
      } else if (e.key === "Home") {
        newVal = getChannelRange(props.channel).min;
        handled = true;
      } else if (e.key === "End") {
        newVal = getChannelRange(props.channel).max;
        handled = true;
      }

      if (handled) {
        e.preventDefault();
        updateFromChannelValue(newVal);
      }
    }
  };

  const handleWheel: JSX.EventHandler<HTMLInputElement, WheelEvent> = (e) => {
    if (props.disableWheelChange || props.disabled || props.readonly || !props.channel) return;
    e.preventDefault();
    const direction = e.deltaY < 0 ? 1 : -1;
    const stepSize = (props.step ?? COLOR_FIELD_DEFAULTS.step) * direction;
    const currentVal = parseFloat(displayValue()) || 0;
    updateFromChannelValue(currentVal + stepSize);
  };

  return (
    <Tag
      data-slot="root"
      data-theme={theme()}
      class={classes().root}
      data-channel={props.channel}
      data-color-space={colorSpace()}
      data-value={currentHex()}
      data-disabled={props.disabled ? "true" : "false"}
      data-readonly={props.readonly ? "true" : "false"}
      {...rest}
    >
      <div class={classes().swatch} data-slot="swatch" style={{ "--rl-swatch": currentHex() }} />
      <input
        type="text"
        class={classes().input}
        data-slot="input"
        placeholder={props.placeholder}
        required={props.required}
        disabled={props.disabled}
        readonly={props.readonly}
        value={displayValue()}
        onInput={handleInputChange}
        onKeyDown={handleKeyDown}
        onWheel={handleWheel}
      />
      <Show when={props.name}>
        <input type="hidden" name={props.name} value={currentHex()} data-main-input />
      </Show>
      {children()}
    </Tag>
  );
};
