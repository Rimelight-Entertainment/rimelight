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
   * Custom UI overrides.
   */
  ui?: any
  /**
   * Root CSS class name.
   */
  class?: any
  [key: string]: unknown
}
