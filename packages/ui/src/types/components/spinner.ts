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
   * UI class override map.
   */
  ui?: any
  /**
   * Root CSS class overrides.
   */
  class?: any
  [key: string]: unknown
}
