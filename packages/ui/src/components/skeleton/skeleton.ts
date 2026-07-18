export interface SkeletonProps {
  /**
   * The visual rounding variant.
   */
  shape?: "circle" | "rectangle" | "rounded"
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
