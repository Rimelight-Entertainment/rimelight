import type { JSX } from "@solidjs/web";

export interface RLFieldGroupProps {
  /**
   * Text/icon to prepend.
   */
  prependSlot?: JSX.Element;
  /**
   * Text/icon to append.
   */
  appendSlot?: JSX.Element;
  /**
   * Size scale.
   */
  size?: "sm" | "md" | "lg";
  /**
   * Slot-specific CSS class overrides.
   */
  ui?: any;
  /**
   * Additional CSS classes to apply to the root element.
   */
  class?: any;
  children?: JSX.Element;
  [key: string]: unknown;
}
