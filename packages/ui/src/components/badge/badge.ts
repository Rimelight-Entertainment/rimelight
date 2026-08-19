import type { Theme, ThemeColor } from "../../types"

export interface BadgeProps {
  label?: string
  /**
   * Visual style variant.
   */
  variant?: "solid" | "outline" | "soft" | "ghost"
  /**
   * Color scheme applied.
   */
  color?: ThemeColor
  /**
   * The size scale of the badge.
   */
  size?: "sm" | "md" | "lg"
  /**
   * The shape corner rounding.
   */
  shape?: "square" | "rounded" | "pill"
  /**
   * Theme mode override â€” pins colors to flat, light, or dark mode.
   */
  theme?: Theme
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
