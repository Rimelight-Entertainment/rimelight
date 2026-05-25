export interface InputPinProps {
  /**
   * Number of pins.
   */
  length?: number
  /**
   * The input value.
   */
  value?: string
  /**
   * Disabled state.
   */
  disabled?: boolean
  /**
   * Error state.
   */
  error?: boolean | string
  /**
   * Size scale.
   */
  size?: "sm" | "md" | "lg"
  /**
   * Color theme.
   */
  color?: "primary" | "secondary" | "success" | "warning" | "error" | "info"
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
