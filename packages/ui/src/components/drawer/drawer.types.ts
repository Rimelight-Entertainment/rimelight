import type { JSX } from "@solidjs/web";
import type { OverlaySlot } from "../../slot";

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
  /**
   * Trigger element. Always rendered, so it is plain JSX.
   */
  triggerSlot?: JSX.Element;
  /**
   * Title content. Function-only: invoked inside the open dialog.
   */
  titleSlot?: OverlaySlot;
  /**
   * Description content. Function-only: invoked inside the open dialog.
   */
  descriptionSlot?: OverlaySlot;
  /**
   * Footer content. Function-only: invoked inside the open dialog.
   */
  footerSlot?: OverlaySlot;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  closeOnClickOutside?: boolean;
  closeOnEscape?: boolean;
  lockScroll?: boolean;
  [key: string]: unknown;
}
