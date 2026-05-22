export interface LogoProps {
  /**
   * The visual variant of the logo.
   */
  variant?: "logomark" | "logotype" | "full" | string
  /**
   * The color mode of the logo.
   */
  mode?: "color" | "white" | "black"
  /**
   * The destination URL when the logo is clicked.
   */
  href?: string
  /**
   * Accessible description of the logo.
   */
  alt?: string
  /**
   * Slot-specific CSS class overrides.
   */
  ui?: any
  /**
   * Additional CSS classes to apply to the root component.
   */
  class?: any
  [key: string]: unknown
}
