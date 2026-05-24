export interface CardProps {
  /**
   * Card heading title.
   */
  title?: string
  /**
   * Subtitle description text.
   */
  description?: string
  /**
   * Media source (e.g. image url) displayed at top.
   */
  mediaSrc?: string
  /**
   * Link reference makes the entire card interactive.
   */
  href?: string
  /**
   * Glassmorphism or overlay style.
   */
  overlay?: boolean
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
