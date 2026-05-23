export interface SkeletonProps {
  /**
   * The visual rounding variant.
   */
  shape?: "circle" | "rectangle" | "rounded"
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
