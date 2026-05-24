export interface FormFieldProps {
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
   * Slot-specific CSS class overrides.
   */
  ui?: any
  /**
   * Additional CSS classes to apply to the root element.
   */
  class?: any
  [key: string]: unknown
}
