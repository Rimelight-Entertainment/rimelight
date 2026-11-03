import type { JSX } from "@solidjs/web";

export interface RLPopoverProps {
  /**
   * Controlled open state.
   */
  open?: boolean;
  /**
   * The trigger label to render.
   */
  triggerLabel?: string;
  /**
   * The placement of the popover relative to trigger.
   */
  placement?: "top" | "bottom" | "bottom-end" | "bottom-start" | "left" | "right";
  /**
   * Trigger mode: 'click', 'hover', or 'both'.
   */
  mode?: "click" | "hover" | "both";
  /**
   * Size variant for padding.
   */
  size?: "xs" | "sm" | "md" | "lg" | (string & {}) | undefined;
  /**
   * Slot-specific CSS class overrides.
   */
  ui?: any;
  /**
   * Additional CSS classes to apply to the root element.
   */
  class?: any;
  children?: JSX.Element;
  triggerSlot?: JSX.Element;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  [key: string]: unknown;
}
