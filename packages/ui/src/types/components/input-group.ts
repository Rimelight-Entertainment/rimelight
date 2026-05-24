export interface InputGroupProps {
  /**
   * Text/icon to prepend.
   */
  prepend?: string
  /**
   * Text/icon to append.
   */
  append?: string
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
