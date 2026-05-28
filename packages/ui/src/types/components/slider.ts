import type { Theme } from "../theme"

export interface SliderProps {
  /**
   * The value of the range input.
   */
  value?: number
  /**
   * Minimum boundary.
   */
  min?: number
  /**
   * Maximum boundary.
   */
  max?: number
  /**
   * Steps size.
   */
  step?: number
  /**
   * Form element input name.
   */
  name?: string
  /**
   * Color theme.
   */
  color?: "primary" | "secondary" | "success" | "warning" | "error" | "info" | "neutral" | "commentary" | "ideation" | "source" | (string & {})
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
