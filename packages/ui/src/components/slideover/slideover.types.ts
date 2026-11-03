import type { JSX } from "@solidjs/web";
import type { InferThemeProps } from "../../resolver";
import type { OverlaySlot } from "../../slot";
import type { RLSlideoverTheme } from "./slideover.theme";

export type RLSlideoverProps = Omit<InferThemeProps<typeof RLSlideoverTheme>, "side"> & {
  /**
   * Edge the sheet slides in from.
   *
   * @default "left"
   */
  side?: "top" | "right" | "bottom" | "left" | undefined;
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
   * Title of the sheet. Use `titleSlot` for JSX.
   */
  title?: string | undefined;
  /**
   * Description of the sheet. Use `descriptionSlot` for JSX.
   */
  description?: string | undefined;
  /**
   * Label of a default trigger button. Rendered only when `triggerSlot` is not set.
   */
  triggerLabel?: string | undefined;
  /**
   * Whether the sheet can be dismissed by the close button, Escape, or clicking the backdrop.
   *
   * @default true
   */
  dismissible?: boolean | undefined;
  /**
   * Keep content mounted in the DOM when hidden.
   *
   * @default true
   */
  unmountOnHide?: boolean | undefined;
  /**
   * Render in a portal attached to `document.body` or the given element.
   * Set to false to render inline.
   *
   * @default true
   */
  portal?: boolean | HTMLElement | undefined;
  /**
   * Body content.
   */
  children?: JSX.Element | undefined;
  /**
   * Trigger element. Always rendered, so it is plain JSX.
   */
  triggerSlot?: JSX.Element | undefined;
  /**
   * Title content. Takes precedence over the `title` string. Function-only: invoked while the sheet is mounted.
   */
  titleSlot?: OverlaySlot | undefined;
  /**
   * Description content. Takes precedence over the `description` string. Function-only: invoked while the sheet is mounted.
   */
  descriptionSlot?: OverlaySlot | undefined;
  /**
   * Footer content. Function-only: invoked while the sheet is mounted.
   */
  footerSlot?: OverlaySlot | undefined;
  /**
   * Called whenever the open state changes.
   */
  onOpenChange?: ((open: boolean) => void) | undefined;
};
