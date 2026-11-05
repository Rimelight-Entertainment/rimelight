import type { JSX } from "@solidjs/web";
import type { SlotRenderer } from "../../types";
import type { InferThemeProps } from "../../resolver";
import type { RLPopoverTheme } from "./popover.theme";

export type RLPopoverProps = InferThemeProps<typeof RLPopoverTheme> & {
  /**
   * Which interactions open the popover: `"click"`, `"hover"`, or `"both"`.
   *
   * @default "both"
   */
  mode?: "click" | "hover" | "both" | undefined;
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
   * Label of a default trigger button. Rendered only when `triggerSlot` is not set.
   */
  triggerLabel?: string | undefined;
  /**
   * Popover body content.
   */
  children?: JSX.Element | undefined;
  /**
   * Trigger element. Replaces the default trigger button.
   */
  triggerSlot?: SlotRenderer | undefined;
  /**
   * Called whenever the open state changes through a click or outside click.
   */
  onOpenChange?: ((open: boolean) => void) | undefined;
};
