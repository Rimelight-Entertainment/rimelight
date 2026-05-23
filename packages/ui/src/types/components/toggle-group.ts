export interface ToggleGroupProps {
  /**
   * The active selection items array.
   */
  value?: string[]
  /**
   * Allows single or multiple selections.
   */
  type?: "single" | "multiple"
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
