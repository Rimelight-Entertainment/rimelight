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
   * Slot-specific CSS class overrides.
   */
  ui?: any
  /**
   * Additional CSS classes to apply to the root element.
   */
  class?: any
  [key: string]: unknown
}

