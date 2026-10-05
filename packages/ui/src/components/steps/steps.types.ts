import type { JSX } from "@solidjs/web";

export interface RLStepsProps {
  /**
   * Controls the size of the step indicators and spacing.
   *
   * @default "md"
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
