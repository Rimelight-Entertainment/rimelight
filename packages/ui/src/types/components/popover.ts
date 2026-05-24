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
   * Slot-specific CSS class overrides.
   */
  ui?: any
  /**
   * Additional CSS classes to apply to the root element.
   */
  class?: any
  [key: string]: unknown
}

