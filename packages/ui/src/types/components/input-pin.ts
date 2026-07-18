import type { ThemeColor } from "../../themes/theme"
export interface InputPinProps {
  /**
   * Number of pins.
   */
  length?: number
  /**
   * The input value.
   */
  value?: string
  /**
   * Disabled state.
   */
  disabled?: boolean
  /**
   * Error state.
   */
  error?: boolean | string
  /**
   * Size scale.
   */
  size?: "sm" | "md" | "lg"
  /**
   * Color theme.
   */
  color?: ThemeColor
  /**
   * Slot-specific CSS class overrides.
   */
  ui?: any
  /**
   * Additional CSS classes to apply to the root element.
   */
  class?: any
  [key: string]: unknown
}
