import type { Theme } from "../theme"

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
  color?: "primary" | "secondary" | "success" | "warning" | "error" | "info" | "neutral" | "commentary" | "ideation" | "source" | (string & {})
  /**
   * The height size category.
   */
  size?: "sm" | "md" | "lg"
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
