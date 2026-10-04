import type { JSX } from "@solidjs/web";
import type { Theme, ThemeColor } from "../../types";

export interface RLColorSliderProps {
  channel: "hue" | "saturation" | "red" | "green" | "blue" | "alpha" | "lightness" | "brightness";
  colorSpace?: "hsl" | "rgb" | "hsb";
  defaultValue?: string;
  dir?: "ltr" | "rtl";
  disabled?: boolean;
  inverted?: boolean;
  modelValue?: string;
  name?: string;
  orientation?: "vertical" | "horizontal";
  required?: boolean;
  step?: number;
  color?: ThemeColor;
  theme?: Theme;
  ui?: any;
  class?: any;
  children?: JSX.Element;
  value?: string;
  onChange?: (val: string) => void;
  onChangeEnd?: (val: string) => void;
  "onUpdate:modelValue"?: (val: string) => void;
  [key: string]: unknown;
}
