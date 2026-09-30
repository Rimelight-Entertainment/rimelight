export interface SplitterProps {
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
  [key: string]: unknown;
}
