export interface SeparatorProps {
  /**
   * The visual layout orientation.
   */
  orientation?: "horizontal" | "vertical"
  /**
   * Whether to treat as purely decorative (hides from accessibility tree).
   */
  decorative?: boolean
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
