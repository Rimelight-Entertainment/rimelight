export interface AspectRatioProps {
  /**
   * The aspect ratio fraction/decimal (e.g. 16/9, 4/3, 1).
   */
  ratio?: number
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
