import type { Theme } from "../../types/component"

export interface LinkProps {
  /**
   * The HTML tag or component to render the link as. Defaults to "a".
   */
  tag?: any
  /**
   * Route path or location object for client-side navigation.
   */
  to?: string | object
  /**
   * Direct URL the link points to.
   */
  href?: string
  /**
   * Where to open the linked URL.
   */
  target?: string
  /**
   * Relationship of the linked URL.
   */
  rel?: string
  /**
   * Forces the link to be treated as an external link.
   */
  external?: boolean
  /**
   * Replaces the current history entry instead of pushing a new one.
   */
  replace?: boolean
  /**
   * Applies active styling to the link.
   */
  active?: boolean
  /**
   * Only matches the link as active if the path is an exact match.
   */
  exact?: boolean
  /**
   * Controls how query strings are compared for active matching.
   */
  exactQuery?: boolean | "partial"
  /**
   * Controls how the URL hash is compared for active matching.
   */
  exactHash?: boolean
  /**
   * CSS class applied when the link is inactive.
   */
  inactiveClass?: string
  /**
   * CSS class applied when the link is active.
   */
  activeClass?: string
  /**
   * The text label displayed inside the link. Alternative to passing children via the default slot.
   */
  label?: string
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
   * Trailing icon name shown after the link label
   */
  trailingIcon?: string
  /**
   * Suppress the automatic external link icon
   */
  noExternalIcon?: boolean
  /**
   * Force a color-scheme context on the link
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
