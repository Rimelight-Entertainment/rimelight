export interface LinkGroupProps {
  /**
   * The title of the link group.
   */
  title?: string
  /**
   * The links in the group.
   */
  links?: { label: string; href: string; [key: string]: any }[]
  /**
   * Slot-specific CSS class overrides.
   */
  ui?: any
  /**
   * Force a theme mode for the link group (flat, light, dark).
   */
  theme?: "flat" | "light" | "dark"
  /**
   * Additional CSS classes to apply to the root element.
   */
  class?: any
  [key: string]: unknown
}
