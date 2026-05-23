export interface FieldProps {
  /**
   * Label for the field.
   */
  label?: string
  /**
   * Description text.
   */
  description?: string
  /**
   * Error message.
   */
  error?: string
  /**
   * Required field state.
   */
  required?: boolean
  /**
   * Size scale.
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
