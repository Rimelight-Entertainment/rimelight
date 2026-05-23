export interface SwitchProps {
  /**
   * Controlled checked state.
   */
  checked?: boolean
  /**
   * Disabled state.
   */
  disabled?: boolean
  /**
   * Input element name.
   */
  name?: string
  /**
   * Label descriptor.
   */
  label?: string
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
