export interface ToggleProps {
  /**
   * Controlled active state.
   */
  active?: boolean
  /**
   * Disabled state.
   */
  disabled?: boolean
  /**
   * Size scale.
   */
  size?: "sm" | "md" | "lg"
  /**
   * Color theme.
   */
  color?: "primary" | "secondary" | "success" | "warning" | "error" | "info"
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
