export interface IconProps {
  /**
   * The name of the icon to display.
   */
  name: string
  /**
   * The size scale of the icon.
   */
  size?: "xs" | "sm" | "md" | "lg" | "xl"
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
