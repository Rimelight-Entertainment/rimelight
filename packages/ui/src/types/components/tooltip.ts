export interface TooltipProps {
  /**
   * The text content to display inside the tooltip.
   */
  content?: string
  /**
   * Controlled open state.
   */
  open?: boolean
  /**
   * Placement of the tooltip relative to the trigger.
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

