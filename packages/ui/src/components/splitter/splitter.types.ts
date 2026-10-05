import type { JSX } from "@solidjs/web";

export interface RLSplitterProps {
  /**
   * Resizing orientation.
   */
  direction?: "horizontal" | "vertical";
  /**
   * Panel sizes array in percentage.
   */
  defaultSizes?: number[];
  /**
   * Slot-specific CSS class overrides.
   */
  ui?: any;
  /**
   * Additional CSS classes to apply to the root element.
   */
  class?: any;
  children?: JSX.Element;
  panels?: JSX.Element[];
  [key: string]: unknown;
}
