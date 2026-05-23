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
   * UI mapping override.
   */
  ui?: any
  /**
   * Root CSS class name override.
   */
  class?: any
  [key: string]: unknown
}
