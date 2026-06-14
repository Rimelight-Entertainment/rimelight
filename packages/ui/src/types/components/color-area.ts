import type { Theme, ThemeColor } from "../theme"

export interface ColorAreaProps {
  colorSpace?: "hsl" | "rgb" | "hsb"
  defaultValue?: string
  disabled?: boolean
  modelValue?: string
  name?: string
  required?: boolean
  xChannel?: "hue" | "saturation" | "red" | "green" | "blue" | "alpha" | "lightness" | "brightness"
  xName?: string
  yChannel?: "hue" | "saturation" | "red" | "green" | "blue" | "alpha" | "lightness" | "brightness"
  yName?: string
  color?: ThemeColor
  theme?: Theme
  ui?: any
  class?: any
  [key: string]: unknown
}
