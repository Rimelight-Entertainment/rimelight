export interface GridProps {
  /**
   * Number of columns on desktop viewports.
   */
  cols?: 1 | 2 | 3 | 4 | 5 | 6;
  /**
   * Staggered height layout for grid items.
   */
  stagger?: boolean;
  /**
   * Grid gap size.
   */
  gap?: "none" | "xs" | "sm" | "md" | "lg" | "xl";
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
