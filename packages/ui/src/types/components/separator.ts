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
   * UI slot custom overrides.
   */
  ui?: any
  /**
   * Custom CSS class name.
   */
  class?: any
  [key: string]: unknown
}
