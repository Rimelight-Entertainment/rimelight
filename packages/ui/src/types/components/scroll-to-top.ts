export interface ScrollToTopProps {
  /**
   * The color scheme applied to the scroll-to-top button.
   */
  color?: "primary" | "secondary" | "success" | "warning" | "error" | "info" | "white" | "black"
  /**
   * The width of the progress indicator line.
   */
  progressWidth?: number
  /**
   * The duration of the scroll-to-top animation in milliseconds.
   */
  duration?: number
  /**
   * The scroll threshold in pixels before showing the button.
   */
  threshold?: number
  /**
   * Whether to show the scroll progress indicator.
   */
  showProgress?: boolean
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
