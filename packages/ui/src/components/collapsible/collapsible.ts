import type { JSX } from "@solidjs/web";
import type { ThemeColor } from "../../types";
export interface RLCollapsibleProps {
  /**
   * Controlled open state.
   */
  open?: boolean;
  /**
   * The trigger button label (or use 'trigger' slot)
   */
  label?: string;
  /**
   * An optional leading icon for the trigger button
   */
  icon?: string;
  /**
   * Size scale of the trigger.
   */
  size?: "sm" | "md" | "lg";
  /**
   * Color theme of the trigger.
   */
  color?: ThemeColor;
  /**
   * Slot-specific CSS class overrides.
   */
  ui?: any;
  /**
   * Additional CSS classes to apply to the root element.
   */
  class?: any;
  children?: JSX.Element;
  triggerSlot?: JSX.Element;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  [key: string]: unknown;
}
