export interface LogoProps {
  /**
   * The visual variant of the logo.
   */
  variant?: "logomark" | "logotype" | "full";
  /**
   * The color mode of the logo.
   */
  mode?: "color" | "white" | "black";
  /**
   * Theme override — pins the logo rendering to `"light"` or `"dark"` color-scheme context, causing
   * `light-dark()` variables to resolve to the correct scheme regardless of the global page mode.
   */
  theme?: "light" | "dark";
  /**
   * The destination URL when the logo is clicked.
   */
  href?: string;
  /**
   * Accessible description of the logo.
   */
  alt?: string;
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
