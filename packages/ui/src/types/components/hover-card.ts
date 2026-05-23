export interface HoverCardProps {
  /**
   * Label of the trigger.
   */
  triggerLabel?: string
  /**
   * Placement relative to trigger.
   */
  placement?: "top" | "bottom" | "left" | "right"
  /**
   * UI slot override map.
   */
  ui?: any
  /**
   * Root CSS class override.
   */
  class?: any
  [key: string]: unknown
}
