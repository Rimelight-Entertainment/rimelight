import type { JSX } from "@solidjs/web";

export interface RLLabelProps {
  /**
   * The associated form input element ID.
   */
  for?: string;
  /**
   * Label size.
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
