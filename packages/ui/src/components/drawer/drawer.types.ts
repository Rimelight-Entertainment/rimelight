import type { JSX } from "@solidjs/web";

export interface RLDrawerProps {
  /**
   * Controlled open state.
   */
  open?: boolean;
  /**
   * The orientation/side where the drawer anchors.
   */
  direction?: "bottom" | "top" | "left" | "right";
  /**
   * Main text title.
   */
  title?: string;
  /**
   * Explanation subtitle.
   */
  description?: string;
  /**
   * Trigger button content.
   */
  triggerLabel?: string;
  /**
   * Slot-specific CSS class overrides.
   */
  ui?: any;
  /**
   * Additional CSS classes to apply to the root element.
   */
  class?: any;
  children?: JSX.Element;
  trigger?: JSX.Element;
  triggerSlot?: JSX.Element;
  titleSlot?: JSX.Element;
  descriptionSlot?: JSX.Element;
  footer?: JSX.Element;
  footerSlot?: JSX.Element;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  closeOnClickOutside?: boolean;
  closeOnEscape?: boolean;
  lockScroll?: boolean;
  [key: string]: unknown;
}
