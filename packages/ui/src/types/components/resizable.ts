export interface ResizableProps {
  /**
   * Resizing orientation.
   */
  direction?: "horizontal" | "vertical"
  /**
   * Panel sizes array in percentage.
   */
  defaultSizes?: number[]
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
