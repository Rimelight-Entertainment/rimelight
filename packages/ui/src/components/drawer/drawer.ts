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
   * Slot-specific CSS class overrides.
   */
  ui?: any
  /**
   * Additional CSS classes to apply to the root element.
   */
  class?: any
  [key: string]: unknown
}
