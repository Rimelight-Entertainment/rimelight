import type { JSX } from "@solidjs/web";

export interface RLFieldGroupProps {
  /**
   * Text/icon to prepend.
   */
  prepend?: string | JSX.Element;
  /**
   * Text/icon to append.
   */
  append?: string | JSX.Element;
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
