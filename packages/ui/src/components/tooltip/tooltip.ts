import type { JSX } from "@solidjs/web";

export interface RLTooltipProps {
  /**
   * The text content to display inside the tooltip.
   */
  content?: string;
  /**
   * Controlled open state.
   */
  open?: boolean;
  /**
   * Placement of the tooltip relative to the trigger.
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
  children?: JSX.Element;
  contentSlot?: JSX.Element;
  [key: string]: unknown;
}
