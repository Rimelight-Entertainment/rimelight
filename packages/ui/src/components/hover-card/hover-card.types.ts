import type { JSX } from "@solidjs/web";
import type { InferThemeProps } from "../../resolver";
import type { RLHoverCardTheme } from "./hover-card.theme";

export type RLHoverCardProps = Omit<InferThemeProps<typeof RLHoverCardTheme>, "side"> & {
  /**
   * Label of a default trigger. Rendered only when `triggerSlot` is not set.
   */
  triggerLabel?: string | undefined;
  /**
   * Edge of the trigger the card attaches to.
   *
   * @default "bottom"
   */
  side?: "top" | "bottom" | "left" | "right" | undefined;
  /**
   * Controlled open state. Hover and focus on the trigger request open changes through `onOpenChange`.
   *
   * @default false
   */
  open?: boolean | undefined;
  /**
   * Initial open state when uncontrolled.
   *
   * @default false
   */
  defaultOpen?: boolean | undefined;
  /**
   * Card body content.
   */
  children?: JSX.Element | undefined;
  /**
   * Trigger element. Replaces `triggerLabel`.
   */
  triggerSlot?: JSX.Element | undefined;
  /**
   * Called whenever the open state changes through hover, focus, or Escape.
   */
  onOpenChange?: ((open: boolean) => void) | undefined;
};
