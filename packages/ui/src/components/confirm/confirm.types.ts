import type { JSX } from "@solidjs/web";
import type { InferThemeProps } from "../../resolver";
import type { ThemeColor } from "../../types";
import type { OverlaySlot } from "../../slot";
import type { ModalSize } from "../modal/modal.types";
import type { RLConfirmTheme } from "./confirm.theme";

export type RLConfirmProps = Omit<
  InferThemeProps<typeof RLConfirmTheme>,
  "color" | "aria-label" | "aria-labelledby" | "aria-describedby"
> & {
  /**
   * Accessible label for the dialog. Forwarded to the modal.
   */
  "aria-label"?: string | undefined;
  /**
   * Element id that labels the dialog. Forwarded to the modal.
   */
  "aria-labelledby"?: string | undefined;
  /**
   * Element id that describes the dialog. Forwarded to the modal.
   */
  "aria-describedby"?: string | undefined;
  /**
   * Intent color of the confirm action button. Use `"error"` for destructive actions.
   *
   * @default "primary"
   */
  color?: ThemeColor | undefined;
  /**
   * Title of the confirmation dialog. Use `titleSlot` for JSX.
   */
  title?: string | undefined;
  /**
   * Explanatory description. Use `descriptionSlot` for JSX.
   */
  description?: string | undefined;
  /**
   * Label for the confirmation action button.
   *
   * @default "Confirm"
   */
  actionLabel?: string | undefined;
  /**
   * Label for the cancel button.
   *
   * @default "Cancel"
   */
  cancelLabel?: string | undefined;
  /**
   * Label of a default trigger button. Rendered only when `triggerSlot` is not set.
   */
  triggerLabel?: string | undefined;
  /**
   * Controlled open state.
   */
  open?: boolean | undefined;
  /**
   * Initial open state when uncontrolled.
   *
   * @default false
   */
  defaultOpen?: boolean | undefined;
  /**
   * Dialog width preset. Forwarded to the modal, which defaults to `"md"`.
   */
  size?: ModalSize | undefined;
  /**
   * Whether the dialog can be dismissed by the close button, Escape, or clicking the backdrop.
   * Dismissal is reported as a cancel.
   *
   * @default true
   */
  dismissible?: boolean | undefined;
  /**
   * Render in a portal attached to `document.body` or the given element.
   *
   * @default true
   */
  portal?: boolean | HTMLElement | undefined;
  /**
   * Enable open/close transitions.
   *
   * @default true
   */
  transition?: boolean | undefined;
  /**
   * Prevents body scrolling while open.
   *
   * @default true
   */
  lockScroll?: boolean | undefined;
  /**
   * Keep content mounted in the DOM while hidden.
   *
   * @default true
   */
  unmountOnHide?: boolean | undefined;
  /**
   * Body content.
   */
  children?: JSX.Element | undefined;
  /**
   * Trigger element. Always rendered, so it is plain JSX.
   */
  triggerSlot?: JSX.Element | undefined;
  /**
   * Title content. Takes precedence over the `title` string.
   */
  titleSlot?: OverlaySlot | undefined;
  /**
   * Description content. Takes precedence over the `description` string.
   */
  descriptionSlot?: OverlaySlot | undefined;
  /**
   * Footer content. Replaces the default Cancel/Confirm row.
   */
  footerSlot?: OverlaySlot | undefined;
  /**
   * Called whenever the open state changes.
   */
  onOpenChange?: ((open: boolean) => void) | undefined;
  /**
   * Called when the confirm action button is clicked.
   */
  onConfirm?: (() => void) | undefined;
  /**
   * Called when the dialog is cancelled: by the cancel button, the close button, Escape, or the backdrop.
   */
  onCancel?: (() => void) | undefined;
};
