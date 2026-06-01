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
   * Styles the link visually as a button
   *
   * @default false
   */
  isButton?: boolean
  /**
   * Screen reader accessibility label. Will automatically append " (opens in a new tab)" for
   * external links if not customized
   */
  ariaLabel?: string
  /**
   * Custom external link icon name
   */
  externalIcon?: string
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
