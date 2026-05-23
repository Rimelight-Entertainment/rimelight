export interface DrawerProps {
  /**
   * Controlled open state.
   */
  open?: boolean
  /**
   * The orientation/side where the drawer anchors.
   */
  direction?: "bottom" | "top" | "left" | "right"
  /**
   * Main text title.
   */
  title?: string
  /**
   * Explanation subtitle.
   */
  description?: string
  /**
   * Trigger button content.
   */
  triggerLabel?: string
  /**
   * UI mapping override.
   */
  ui?: any
  /**
   * Root CSS class override.
   */
  class?: any
  [key: string]: unknown
}
