import type { JSX } from "@solidjs/web";
import type { Theme, ThemeColor } from "../../types";

export interface RLColorAreaProps {
  colorSpace?: "hsl" | "rgb" | "hsb";
  defaultValue?: string;
  disabled?: boolean;
  modelValue?: string;
  name?: string;
  required?: boolean;
  xChannel?: "hue" | "saturation" | "red" | "green" | "blue" | "alpha" | "lightness" | "brightness";
  xName?: string;
  yChannel?: "hue" | "saturation" | "red" | "green" | "blue" | "alpha" | "lightness" | "brightness";
  yName?: string;
  color?: ThemeColor;
  theme?: Theme;
  ui?: any;
  class?: any;
  onChange?: (value: string) => void;
  onValueChange?: (value: string) => void;
  onChangeEnd?: (value: string) => void;
  children?: JSX.Element;
  [key: string]: unknown;
}
