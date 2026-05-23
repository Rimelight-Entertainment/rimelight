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
   * Custom UI overrides.
   */
  ui?: any
  /**
   * Root CSS class override.
   */
  class?: any
  [key: string]: unknown
}
