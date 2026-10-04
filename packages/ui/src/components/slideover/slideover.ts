import type { JSX } from "@solidjs/web";

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
  trigger?: JSX.Element;
  triggerSlot?: JSX.Element;
  titleSlot?: JSX.Element;
  descriptionSlot?: JSX.Element;
  footer?: JSX.Element;
  footerSlot?: JSX.Element;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  [key: string]: unknown;
}
