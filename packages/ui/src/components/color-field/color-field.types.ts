import type { JSX } from "@solidjs/web";
import type { Theme, ThemeColor } from "../../types";

export interface RLColorFieldProps {
  channel?: "hue" | "saturation" | "red" | "green" | "blue" | "alpha" | "lightness" | "brightness";
  colorSpace?: "hsl" | "rgb" | "hsb";
  defaultValue?: string;
  disabled?: boolean;
  disableWheelChange?: boolean;
  locale?: string;
  name?: string;
  placeholder?: string;
  readonly?: boolean;
  required?: boolean;
  step?: number;
  color?: ThemeColor;
  theme?: Theme;
  ui?: any;
  class?: any;
  children?: JSX.Element;
  value?: string;
  onValueChange?: (val: string) => void;
  [key: string]: unknown;
}
