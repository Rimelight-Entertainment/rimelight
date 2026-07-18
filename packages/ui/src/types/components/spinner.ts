import type { Theme, ThemeColor } from "../../themes/theme"

export interface SpinnerProps {
  /**
   * The size scale of the spinner.
   */
  size?: "xs" | "sm" | "md" | "lg" | "xl"
  /**
   * The color theme.
   */
  color?: ThemeColor | "current"
  /**
   * Theme mode override — pins colors to flat, light, or dark mode.
   */
  theme?: Theme
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
