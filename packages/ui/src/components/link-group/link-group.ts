import type { LinkProps } from "../link/link"

export interface LinkGroupProps {
  /**
   * The direct text label of the group heading.
   */
  label?: string | undefined
  /**
   * Leading icon of the group heading.
   */
  leadingIcon?: string | undefined
  /**
   * Trailing icon of the group heading.
   */
  trailingIcon?: string | undefined
  /**
   * Hyperlink target URL for the group heading.
   */
  href?: string | undefined
  /**
   * The links in the group. Supports full button/link properties.
   */
  links?: LinkProps | LinkProps[] | undefined
  /**
   * Slot-specific CSS class overrides.
   */
  ui?: any
  /**
   * Force a color-scheme context on the link group. `"light"` or `"dark"` sets `color-scheme` on
   * the root element, causing all `light-dark()` color variables to resolve to the correct scheme
   * regardless of the global page mode.
   */
  theme?: "light" | "dark"
  /**
   * Additional CSS classes to apply to the root element.
   */
  class?: any
  [key: string]: unknown
}
