import type { JSX } from "@solidjs/web";
import type { InferThemeProps } from "../../resolver";
import type { SlotRenderer } from "../../types";
import type { RLDrawerTheme } from "./drawer.theme";

export type RLDrawerProps = Omit<InferThemeProps<typeof RLDrawerTheme>, "side"> & {
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
   * Edge of the viewport the drawer attaches to.
   *
   * @default "bottom"
   */
  side?: "bottom" | "top" | "left" | "right" | undefined;
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
   * Trigger content. Rendered inside a clickable wrapper that opens the drawer.
   */
  triggerSlot?: SlotRenderer;
  /**
   * Title content. Takes precedence over the `title` string. Rendered only while open.
   */
  titleSlot?: SlotRenderer;
  /**
   * Description content. Takes precedence over the `description` string. Rendered only while open.
   */
  descriptionSlot?: SlotRenderer;
  /**
   * Footer content. Rendered only while open.
   */
  footerSlot?: SlotRenderer;
  /**
   * Called whenever the open state changes.
   */
  onOpenChange?: ((open: boolean) => void) | undefined;
};
