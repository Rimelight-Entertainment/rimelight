export interface HoverCardProps {
  /**
   * Label of the trigger.
   */
  triggerLabel?: string;
  /**
   * Placement relative to trigger.
   */
  placement?: "top" | "bottom" | "left" | "right";
  /**
   * Slot-specific CSS class overrides.
   */
  ui?: any;
  /**
   * Additional CSS classes to apply to the root element.
   */
  class?: any;
  [key: string]: unknown;
}
