export interface TextareaProps {
  /**
   * The text value.
   */
  value?: string
  /**
   * Placeholder text.
   */
  placeholder?: string
  /**
   * Disabled state.
   */
  disabled?: boolean
  /**
   * Readonly state.
   */
  readonly?: boolean
  /**
   * Name for forms.
   */
  name?: string
  /**
   * Required field state.
   */
  required?: boolean
  /**
   * Row count.
   */
  rows?: number
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
   * UI class override map.
   */
  ui?: any
  /**
   * Root CSS class override.
   */
  class?: any
  [key: string]: unknown
}
