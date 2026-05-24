export interface FooterProps {
  /**
   * Whether to contain the footer content within a max-width container.
   */
  contain?: boolean
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
