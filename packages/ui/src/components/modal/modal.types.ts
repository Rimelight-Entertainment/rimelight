import type { JSX } from "@solidjs/web";
import type { InferThemeProps } from "../../resolver";
import type { OverlaySlot } from "../../slot";
import type { RLModalTheme } from "./modal.theme";

export type RLModalSize = "xs" | "sm" | "md" | "lg" | "xl";

export type RLModalProps = Omit<
  InferThemeProps<typeof RLModalTheme>,
  "size" | "overlay" | "scrollable" | "transition" | "fullscreen" | "modal" | "role"
> & {
  /**
   * Title text displayed in the modal header. Use `titleSlot` for JSX.
   */
  title?: string | undefined;
  /**
   * Description text displayed below the title. Use `descriptionSlot` for JSX.
   */
  description?: string | undefined;
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
   * Modal width preset.
   *
   * @default "md"
   */
  size?: RLModalSize | undefined;
  /**
   * Render an overlay / backdrop behind the modal.
   *
   * @default true
   */
  overlay?: boolean | undefined;
  /**
   * Enables scrollable overlay mode where content scrolls within the overlay container.
   *
   * @default false
   */
  scrollable?: boolean | undefined;
  /**
   * Animate the modal when opening or closing.
   *
   * @default true
   */
  transition?: boolean | undefined;
  /**
   * Take up the full screen.
   *
   * @default false
   */
  fullscreen?: boolean | undefined;
  /**
   * The modality of the dialog. When true, interaction with outside elements is blocked.
   * When false, the overlay is disabled and outside content remains interactive.
   *
   * @default true
   */
  modal?: boolean | undefined;
  /**
   * Render in a portal attached to `document.body` or the given element.
   * Set to false to render inline.
   *
   * @default true
   */
  portal?: boolean | HTMLElement | undefined;
  /**
   * Whether the modal can be dismissed by the close button, Escape, or clicking the backdrop.
   * Dismissal calls `onOpenChange(false)`.
   *
   * @default true
   */
  dismissible?: boolean | undefined;
  /**
   * Icon name displayed in the header close button.
   *
   * @default "x"
   */
  closeIcon?: string | undefined;
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
   * Label of a default trigger button. Rendered only when `triggerSlot` is not set.
   */
  triggerLabel?: string | undefined;
  /**
   * WAI-ARIA role of the dialog element.
   *
   * @default "dialog"
   */
  role?: "dialog" | "alertdialog" | undefined;
  /**
   * Accessible label of the dialog.
   */
  "aria-label"?: string | undefined;
  /**
   * Element id that labels the dialog. Defaults to the title id when a title is shown.
   */
  "aria-labelledby"?: string | undefined;
  /**
   * Element id that describes the dialog. Defaults to the description id when a description is shown.
   */
  "aria-describedby"?: string | undefined;
  /**
   * Body content. Takes precedence over `children`.
   */
  children?: JSX.Element | undefined;
  /**
   * Trigger element. Always rendered, so it is plain JSX.
   */
  triggerSlot?: JSX.Element | undefined;
  /**
   * Header override. Replaces the default title, description, and close header.
   */
  headerSlot?: OverlaySlot | undefined;
  /**
   * Title content. Takes precedence over the `title` string.
   */
  titleSlot?: OverlaySlot | undefined;
  /**
   * Description content. Takes precedence over the `description` string.
   */
  descriptionSlot?: OverlaySlot | undefined;
  /**
   * Actions rendered in the header.
   */
  actionsSlot?: OverlaySlot | undefined;
  /**
   * Custom close control. Replaces the default close button.
   */
  closeSlot?: OverlaySlot | undefined;
  /**
   * Body content. Takes precedence over `children`.
   */
  bodySlot?: OverlaySlot | undefined;
  /**
   * Footer content.
   */
  footerSlot?: OverlaySlot | undefined;
  /**
   * Called whenever the open state changes. Dismissal calls it with `false`.
   */
  onOpenChange?: ((open: boolean) => void) | undefined;
  /**
   * Called when the modal opens.
   */
  onEnter?: (() => void) | undefined;
  /**
   * Called after the modal has opened.
   */
  onAfterEnter?: (() => void) | undefined;
  /**
   * Called when the modal closes.
   */
  onLeave?: (() => void) | undefined;
  /**
   * Called after the modal has closed.
   */
  onAfterLeave?: (() => void) | undefined;
};
