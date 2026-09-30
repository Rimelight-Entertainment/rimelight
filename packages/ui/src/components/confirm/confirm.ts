export interface ConfirmProps {
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
  [key: string]: unknown;
}
