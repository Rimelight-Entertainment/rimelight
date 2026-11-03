import type { JSX } from "@solidjs/web";
import type { RLModalSize, RLModalUiSlots } from "../modal/modal.types";
import type { OverlaySlot } from "../../slot";

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
   * Trigger element. Always rendered, so it is plain JSX.
   */
  triggerSlot?: JSX.Element | undefined;

  /**
   * Title content. Function-only: invoked while the dialog is open.
   */
  titleSlot?: OverlaySlot | undefined;

  /**
   * Description content. Function-only: invoked while the dialog is open.
   */
  descriptionSlot?: OverlaySlot | undefined;

  /**
   * Footer content. Replaces the default Cancel/Confirm row. Function-only.
   */
  footerSlot?: OverlaySlot | undefined;

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
