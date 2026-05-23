export interface ScrollAreaProps {
  /**
   * Orientation of the scrollbar.
   */
  orientation?: "vertical" | "horizontal" | "both"
  /**
   * Scrollbar visibility delay in ms.
   */
  scrollHideDelay?: number
  /**
   * Height override if needed.
   */
  height?: string | number
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
