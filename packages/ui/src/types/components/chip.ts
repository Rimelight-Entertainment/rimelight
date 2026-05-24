export interface ChipProps {
  /**
   * Theme mode override — pins colors to flat, light, or dark mode.
   */
  theme?: "flat" | "light" | "dark"
  /**
   * Slot-specific CSS class overrides.
   */
  ui?: any
  /**
   * Additional CSS classes to apply to the root element.
   */
  class?: any
  [key: string]: unknown
}