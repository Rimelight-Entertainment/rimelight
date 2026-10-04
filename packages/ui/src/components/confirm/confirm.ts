import type { JSX } from "@solidjs/web";

export interface RLConfirmProps {
  variant?: "default" | "destructive";
  /**
   * Title of the alert confirmation dialog.
   */
  title?: string;
  /**
   * Explanatory description.
   */
  description?: string;
  /**
   * Label for the confirmation action button.
   */
  actionLabel?: string;
  /**
   * Label for the cancellation/close button.
   */
  cancelLabel?: string;
  /**
   * Trigger label to automatically open the dialog.
   */
  triggerLabel?: string;
  /**
   * Controlled open state.
   */
  open?: boolean;
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
  titleSlot?: JSX.Element;
  descriptionSlot?: JSX.Element;
  footer?: JSX.Element;
  footerSlot?: JSX.Element;
  onOpenChange?: (open: boolean) => void;
  onConfirm?: () => void;
  onCancel?: () => void;
  [key: string]: unknown;
}
