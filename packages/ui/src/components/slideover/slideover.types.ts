import type { JSX } from "@solidjs/web";
import type { OverlaySlot } from "../../slot";

export interface RLSlideoverProps {
  /**
   * The edge the sheet slides in from.
   */
  side?: "top" | "right" | "bottom" | "left";
  /**
   * Controlled open state.
   */
  open?: boolean;
  /**
   * Title of the sheet.
   */
  title?: string;
  /**
   * Description of the sheet contents.
   */
  description?: string;
  /**
   * Label of the trigger button.
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
  /**
   * Keep content mounted in the DOM when hidden.
   */
  unmountOnHide?: boolean;
  children?: JSX.Element;
  /**
   * Trigger element. Always rendered, so it is plain JSX.
   */
  triggerSlot?: JSX.Element;
  /**
   * Title content. Function-only: invoked while the sheet is mounted.
   */
  titleSlot?: OverlaySlot;
  /**
   * Description content. Function-only: invoked while the sheet is mounted.
   */
  descriptionSlot?: OverlaySlot;
  /**
   * Footer content. Function-only: invoked while the sheet is mounted.
   */
  footerSlot?: OverlaySlot;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  [key: string]: unknown;
}
