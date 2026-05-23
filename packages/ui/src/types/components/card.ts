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
   * UI mapping override.
   */
  ui?: any
  /**
   * Root CSS class override.
   */
  class?: any
  [key: string]: unknown
}
