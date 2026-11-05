import type { JSX } from "@solidjs/web";
import type { InferThemeProps } from "../../resolver";
import type { SlotRenderer } from "../../types";
import type { RLTooltipTheme } from "./tooltip.theme";

export type RLTooltipProps = Omit<InferThemeProps<typeof RLTooltipTheme>, "placement"> & {
  /**
   * Plain text shown inside the tooltip. Used when `bodySlot` is not set.
   */
  body?: string | undefined;
  /**
   * Placement of the tooltip relative to the trigger.
   *
   * @default "top"
   */
  placement?: "top" | "bottom" | "left" | "right" | undefined;
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
   * Trigger content.
   */
  children?: JSX.Element | undefined;
  /**
   * Tooltip body JSX. Takes precedence over the `body` string.
   */
  bodySlot?: SlotRenderer;
  /**
   * Called whenever the open state changes through hover or focus.
   */
  onOpenChange?: ((open: boolean) => void) | undefined;
};
