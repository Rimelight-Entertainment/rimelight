export interface SpinnerProps {
  /**
   * The size scale of the spinner.
   */
  size?: "xs" | "sm" | "md" | "lg" | "xl"
  /**
   * The color theme.
   */
  color?: "primary" | "secondary" | "success" | "warning" | "error" | "info" | "current"
  /**
   * Theme mode override — pins colors to flat, light, or dark mode.
   */
  theme?: "flat" | "light" | "dark"
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

