export interface LabelProps {
  /**
   * The associated form input element ID.
   */
  for?: string
  /**
   * Label size.
   */
  size?: "sm" | "md" | "lg"
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
