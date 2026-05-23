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
  color?: "primary" | "secondary" | "success" | "warning" | "error" | "info"
  /**
   * The height size category.
   */
  size?: "sm" | "md" | "lg"
  /**
   * UI class override map.
   */
  ui?: any
  /**
   * Root CSS class override.
   */
  class?: any
  [key: string]: unknown
}
