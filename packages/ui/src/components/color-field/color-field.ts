import type { Theme, ThemeColor } from "../../types/theme"

export interface ColorFieldProps {
  channel?: "hue" | "saturation" | "red" | "green" | "blue" | "alpha" | "lightness" | "brightness"
  colorSpace?: "hsl" | "rgb" | "hsb"
  defaultValue?: string
  disabled?: boolean
  disableWheelChange?: boolean
  locale?: string
  modelValue?: string
  name?: string
  placeholder?: string
  readonly?: boolean
  required?: boolean
  step?: number
  color?: ThemeColor
  theme?: Theme
  ui?: any
  class?: any
  [key: string]: unknown
}
