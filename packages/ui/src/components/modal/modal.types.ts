import type { JSX } from "@solidjs/web";

export interface RLModalProps {
  size?: "sm" | "md" | "lg" | "xl";
  /**
   * Controlled open state.
   */
  open?: boolean;
  /**
   * The trigger label to render a default button.
   */
  triggerLabel?: string;
  /**
   * Whether to close the dialog when clicking the backdrop.
   */
  closeOnClickOutside?: boolean;
  /**
   * Whether to close on pressing the Escape key.
   */
  closeOnEscape?: boolean;
  /**
   * Prevents body scrolling when open.
   */
  lockScroll?: boolean;
  /**
   * Main heading of the dialog.
   */
  title?: string;
  /**
   * Description of the dialog purpose.
   */
  description?: string;
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
  onClose?: () => void;
  children?: JSX.Element;
  trigger?: JSX.Element;
  triggerSlot?: JSX.Element;
  titleSlot?: JSX.Element;
  descriptionSlot?: JSX.Element;
  footer?: JSX.Element;
  footerSlot?: JSX.Element;
  [key: string]: unknown;
}
