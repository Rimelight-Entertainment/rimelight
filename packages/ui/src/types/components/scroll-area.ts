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
   * Slot-specific CSS class overrides.
   */
  ui?: any
  /**
   * Additional CSS classes to apply to the root element.
   */
  class?: any
  [key: string]: unknown
}

