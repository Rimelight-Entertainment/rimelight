import type { Theme, ThemeColor } from "../../types"

export interface ProgressProps {
  /**
   * Current value of progress (0 to max).
   */
  value?: number
  /**
   * The maximum boundary (default 100).
   */
  max?: number
  /**
   * Color theme.
   */
  color?: ThemeColor
  /**
   * The height size category.
   */
  size?: "sm" | "md" | "lg"
  /**
   * Theme mode override â€” pins colors to flat, light, or dark mode.
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
