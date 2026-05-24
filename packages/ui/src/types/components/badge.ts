export interface BadgeProps {
  /**
   * Visual style variant.
   */
  variant?: "solid" | "outline" | "soft" | "ghost"
  /**
   * Color scheme applied.
   */
  color?: "primary" | "secondary" | "success" | "warning" | "error" | "info"
  /**
   * The size scale of the badge.
   */
  size?: "sm" | "md" | "lg"
  /**
   * The shape corner rounding.
   */
  shape?: "square" | "rounded" | "pill"
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
