export interface HeaderProps {
  /**
   * HTML tag to render for the root element ("header", "div", "aside", etc.).
   */
  as?: "header" | "div" | "aside" | "section" | (string & {});
  /**
   * Whether to contain the header content within a max-width container.
   */
  contain?: boolean;
  /**
   * Whether the header should be sticky at the top of the viewport.
   */
  sticky?: boolean;
  /**
   * Whether the header should be fixed at the top of the viewport.
   */
  fixed?: boolean;
  /**
   * The z-index stack position of the header.
   */
  stackIndex?: number;
  /**
   * Whether to hide the header when scrolling down and show it when scrolling up.
   */
  hideOnScroll?: boolean;
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
