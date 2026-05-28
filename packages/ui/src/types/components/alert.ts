import type { Theme } from "../theme"

export interface AlertProps {
  /**
   * The visual variant of the alert.
   */
  variant?: "default" | "destructive" | "outline" | "solid"
  /**
   * The color scheme of the alert.
   */
  color?: "primary" | "secondary" | "success" | "warning" | "error" | "info" | "neutral" | "commentary" | "ideation" | "source" | (string & {})
  /**
   * The main title text of the alert.
   */
  title?: string
  /**
   * The secondary description text of the alert.
   */
  description?: string
  /**
   * An optional leading icon.
   */
  icon?: string
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
