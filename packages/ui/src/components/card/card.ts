import type { Theme } from "../../types"

export interface CardProps {
  /**
   * The visual style variant of the card.
   */
  variant?: "solid" | "outline" | "soft" | "subtle"
  /**
   * Theme mode override.
   */
  theme?: Theme
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
