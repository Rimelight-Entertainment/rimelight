import type { JSX } from "@solidjs/web";
import type { InferThemeProps } from "../../resolver";
import type { OverlaySlot } from "../../slot";
import type { RLDrawerTheme } from "./drawer.theme";

export type RLDrawerProps = Omit<InferThemeProps<typeof RLDrawerTheme>, "direction"> & {
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
   * Edge the drawer anchors to.
   *
   * @default "bottom"
   */
  direction?: "bottom" | "top" | "left" | "right" | undefined;
  /**
   * Main title text. Use `titleSlot` for JSX.
   */
  title?: string | undefined;
  /**
   * Explanation subtitle. Use `descriptionSlot` for JSX.
   */
  description?: string | undefined;
  /**
   * Label of a default trigger button. Rendered only when `triggerSlot` is not set.
   */
  triggerLabel?: string | undefined;
  /**
   * Whether the drawer can be dismissed by the close button, Escape, or clicking the backdrop.
   *
   * @default true
   */
  dismissible?: boolean | undefined;
  /**
   * Prevents body scrolling while open.
   *
   * @default true
   */
  lockScroll?: boolean | undefined;
  /**
   * Body content.
   */
  children?: JSX.Element | undefined;
  /**
   * Trigger element. Always rendered, so it is plain JSX.
   */
  triggerSlot?: JSX.Element | undefined;
  /**
   * Title content. Takes precedence over the `title` string. Function-only: invoked inside the open dialog.
   */
  titleSlot?: OverlaySlot | undefined;
  /**
   * Description content. Takes precedence over the `description` string. Function-only: invoked inside the open dialog.
   */
  descriptionSlot?: OverlaySlot | undefined;
  /**
   * Footer content. Function-only: invoked inside the open dialog.
   */
  footerSlot?: OverlaySlot | undefined;
  /**
   * Called whenever the open state changes.
   */
  onOpenChange?: ((open: boolean) => void) | undefined;
};
