import type { Theme, ThemeColor } from "../../index"

export interface ColorSliderProps {
  channel: "hue" | "saturation" | "red" | "green" | "blue" | "alpha" | "lightness" | "brightness"
  colorSpace?: "hsl" | "rgb" | "hsb"
  defaultValue?: string
  dir?: "ltr" | "rtl"
  disabled?: boolean
  inverted?: boolean
  modelValue?: string
  name?: string
  orientation?: "vertical" | "horizontal"
  required?: boolean
  step?: number
  color?: ThemeColor
  theme?: Theme
  ui?: any
  class?: any
  [key: string]: unknown
}
