export interface PopoverProps {
  /**
   * Controlled open state.
   */
  open?: boolean
  /**
   * The trigger label to render.
   */
  triggerLabel?: string
  /**
   * The placement of the popover relative to trigger.
   */
  placement?: "top" | "bottom" | "left" | "right"
  /**
   * UI mapping override.
   */
  ui?: any
  /**
   * Root CSS class.
   */
  class?: any
  [key: string]: unknown
}
