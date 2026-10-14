import type { JSX } from "@solidjs/web";
import type { RLModalSize, RLModalUiSlots } from "../modal/modal.types";

export interface RLConfirmUiSlots extends RLModalUiSlots {
  cancelButton?: string | undefined;
  actionButton?: string | undefined;
}

export interface RLConfirmProps {
  /**
   * Confirmation intent variant. Destructive highlights danger with error colors.
   * @default "default"
   */
  variant?: "default" | "destructive" | undefined;

  /**
   * Title of the alert confirmation dialog.
   */
  title?: string | undefined;

  /**
   * Explanatory description.
   */
  description?: string | undefined;

  /**
   * Label for the confirmation action button.
   * @default "Confirm"
   */
  actionLabel?: string | undefined;

  /**
   * Label for the cancellation/close button.
   * @default "Cancel"
   */
  cancelLabel?: string | undefined;

  /**
   * Trigger button label to automatically render a trigger button.
   */
  triggerLabel?: string | undefined;

  /**
   * Controlled open state.
   */
  open?: boolean | undefined;

  /**
   * Initial open state when uncontrolled.
   * @default false
   */
  defaultOpen?: boolean | undefined;

  /**
   * Dialog size.
   * @default "sm"
   */
  size?: RLModalSize | undefined;

  /**
   * Whether the dialog can be dismissed by clicking outside or pressing Escape.
   * @default true
   */
  dismissible?: boolean | undefined;

  /**
   * Render in a portal attached to document body.
   * @default true
   */
  portal?: boolean | HTMLElement | string | undefined;

  /**
   * Enable open/close transitions.
   * @default true
   */
  transition?: boolean | undefined;

  /**
   * Prevents body scrolling when open.
   * @default true
   */
  lockScroll?: boolean | undefined;

  /**
   * Keep content mounted in DOM when hidden.
   * @default true
   */
  unmountOnHide?: boolean | undefined;

  /**
   * Slot-specific CSS class overrides.
   */
  ui?: Partial<RLConfirmUiSlots> | undefined;

  /**
   * Additional CSS classes to apply to the root element.
   */
  class?: any;

  /**
   * Body content.
   */
  children?: JSX.Element | undefined;

  /**
   * Custom trigger element.
   */
  trigger?: JSX.Element | (() => JSX.Element) | undefined;

  /**
   * Trigger slot override.
   */
  triggerSlot?: JSX.Element | (() => JSX.Element) | undefined;

  /**
   * Title slot override.
   */
  titleSlot?: JSX.Element | (() => JSX.Element) | undefined;

  /**
   * Description slot override.
   */
  descriptionSlot?: JSX.Element | (() => JSX.Element) | undefined;

  /**
   * Custom footer actions slot override.
   */
  footer?: JSX.Element | (() => JSX.Element) | undefined;

  /**
   * Footer slot override.
   */
  footerSlot?: JSX.Element | (() => JSX.Element) | undefined;

  /**
   * Callback fired when open state changes.
   */
  onOpenChange?: ((open: boolean) => void) | undefined;

  /**
   * Callback fired when confirmation action button is clicked.
   */
  onConfirm?: (() => void) | undefined;

  /**
   * Callback fired when cancel button or backdrop is clicked.
   */
  onCancel?: (() => void) | undefined;

  /**
   * Callback fired when dialog is closed.
   */
  onClose?: (() => void) | undefined;

  [key: string]: unknown;
}
