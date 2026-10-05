import type { JSX } from "@solidjs/web";

export interface RLKbdProps {
  color?: string;
  variant?: string;
  theme?: string;
  /**
   * The size scale of the keyboard key component.
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
