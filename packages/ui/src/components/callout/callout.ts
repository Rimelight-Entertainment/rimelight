import type { Theme, ThemeColor } from "../../config"

export interface CalloutProps {
  /**
   * The visual variant of the callout.
   */
  variant?: "default" | "destructive" | "outline" | "solid" | "soft" | "subtle"
  /**
   * The color scheme of the callout.
   */
  color?: ThemeColor
  /**
   * The main title text of the callout.
   */
  title?: string
  /**
   * The secondary description text of the callout.
   */
  description?: string
  /**
   * An optional leading icon.
   */
  icon?: string
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
