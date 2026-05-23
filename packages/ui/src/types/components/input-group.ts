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
   * UI class override map.
   */
  ui?: any
  /**
   * Root CSS class override.
   */
  class?: any
  [key: string]: unknown
}
