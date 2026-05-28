import type { ThemeColor } from "../theme"

export interface LinkProps {
  to?: string | object
  href?: string
  target?: string
  rel?: string
  external?: boolean
  replace?: boolean
  active?: boolean
  exact?: boolean
  exactQuery?: boolean | "partial"
  exactHash?: boolean
  inactiveClass?: string
  activeClass?: string
  variant?: "solid" | "outline" | "soft" | "subtle" | "ghost" | "link"
  color?: ThemeColor
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
