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
  theme?: string
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
