import type { JSX } from "@solidjs/web";
import type { InferThemeProps } from "../../resolver";
import type { RLPopoverTheme } from "./popover.theme";

export type RLPopoverProps = Omit<InferThemeProps<typeof RLPopoverTheme>, "size" | "placement"> & {
  /**
   * Popover padding preset.
   *
   * @default "md"
   */
  size?: "xs" | "sm" | "md" | "lg" | undefined;
  /**
   * Placement of the popover relative to the trigger.
   *
   * @default "bottom"
   */
  placement?:
    | "top"
    | "top-start"
    | "top-end"
    | "bottom"
    | "bottom-start"
    | "bottom-end"
    | "left"
    | "right"
    | undefined;
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
   * Trigger element. Always rendered, so it is plain JSX.
   */
  triggerSlot?: JSX.Element | undefined;
  /**
   * Called whenever the open state changes through a click or outside click.
   */
  onOpenChange?: ((open: boolean) => void) | undefined;
};
