import type { JSX } from "@solidjs/web";
import type { InferThemeProps } from "../../resolver";
import type { SlotRenderer } from "../../types";
import type { RLModalTheme } from "./modal.theme";

export type ModalSize = "xs" | "sm" | "md" | "lg" | "xl";

export type RLModalProps = Omit<
  InferThemeProps<typeof RLModalTheme>,
  "size" | "backdrop" | "scrollable" | "transition" | "fullscreen" | "modal" | "role"
> & {
  /**
   * Heading rendered in the default header. Ignored when `titleSlot` or `headerSlot` is set.
   */
  title?: string | undefined;
  /**
   * Description rendered under the title. Ignored when `descriptionSlot` or `headerSlot` is set.
   */
  description?: string | undefined;
  /**
   * Controlled open state. Pair with `onOpenChange`.
   */
  open?: boolean | undefined;
  /**
   * Initial open state when uncontrolled.
   */
  defaultOpen?: boolean | undefined;
  /**
   * Width of the dialog content.
   */
  size?: ModalSize | undefined;
  /**
   * Renders a scrim behind the dialog. Disable it for a fully transparent overlay.
   */
  backdrop?: boolean | undefined;
  /**
   * Lets the overlay scroll so tall dialogs stay reachable.
   */
  scrollable?: boolean | undefined;
  /**
   * Animates the overlay and content when opening and closing.
   */
  transition?: boolean | undefined;
  /**
   * Stretches the dialog to fill the viewport.
   */
  fullscreen?: boolean | undefined;
  /**
   * When true, the dialog blocks interaction with the page and is announced as modal.
   * When false, the overlay ignores pointer events so outside content stays interactive.
   */
  modal?: boolean | undefined;
  /**
   * Renders the dialog into a portal. Pass an element to choose the mount target.
   */
  portal?: boolean | HTMLElement | undefined;
  /**
   * Allows Escape, the close control, and outside clicks to close the dialog.
   */
  dismissible?: boolean | undefined;
  /**
   * Locks document scrolling while the modal is open.
   */
  lockScroll?: boolean | undefined;
  /**
   * Removes the dialog from the DOM while closed instead of hiding it.
   */
  unmountOnHide?: boolean | undefined;
  /**
   * Label for the default trigger button. Ignored when `triggerSlot` is set.
   */
  triggerLabel?: string | undefined;
  /**
   * ARIA role of the dialog element.
   */
  role?: "dialog" | "alertdialog" | undefined;
  "aria-label"?: string | undefined;
  "aria-labelledby"?: string | undefined;
  "aria-describedby"?: string | undefined;
  /**
   * Body content. Used when `bodySlot` is not set.
   */
  children?: JSX.Element | undefined;
  /**
   * Replaces the default trigger button.
   */
  triggerSlot?: SlotRenderer | undefined;
  /**
   * Replaces the whole header.
   */
  headerSlot?: SlotRenderer | undefined;
  /**
   * Replaces the title.
   */
  titleSlot?: SlotRenderer | undefined;
  /**
   * Replaces the description.
   */
  descriptionSlot?: SlotRenderer | undefined;
  /**
   * Content rendered on the trailing side of the header, before the close control.
   */
  actionsSlot?: SlotRenderer | undefined;
  /**
   * Replaces the default close control.
   */
  closeSlot?: SlotRenderer | undefined;
  /**
   * Replaces the body content. Takes precedence over `children`.
   */
  bodySlot?: SlotRenderer | undefined;
  /**
   * Footer content rendered below the body.
   */
  footerSlot?: SlotRenderer | undefined;
  /**
   * Called whenever the open state changes.
   */
  onOpenChange?: ((open: boolean) => void) | undefined;
  /**
   * Called when the enter transition starts.
   */
  onEnter?: (() => void) | undefined;
  /**
   * Called when the enter transition ends.
   */
  onAfterEnter?: (() => void) | undefined;
  /**
   * Called when the leave transition starts.
   */
  onLeave?: (() => void) | undefined;
  /**
   * Called when the leave transition ends.
   */
  onAfterLeave?: (() => void) | undefined;
};
