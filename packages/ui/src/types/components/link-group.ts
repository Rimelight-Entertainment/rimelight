import type { LinkProps } from "./link"

export interface LinkGroupProps {
  /**
   * Backward compatible title property.
   */
  title?: string | { label: string; leadingIcon?: string; trailingIcon?: string; href?: string }
  /**
   * The direct text label of the group heading.
   */
  label?: string
  /**
   * Leading icon of the group heading.
   */
  leadingIcon?: string
  /**
   * Trailing icon of the group heading.
   */
  trailingIcon?: string
  /**
   * Hyperlink target URL for the group heading.
   */
  href?: string
  /**
   * Router/locale link target for the group heading.
   */
  to?: string | object
  /**
   * The links in the group. Supports full button/link properties.
   */
  links?: LinkProps | LinkProps[]
  /**
   * Slot-specific CSS class overrides.
   */
  ui?: any
  /**
   * Force a theme mode for the link group (flat, light, dark).
   */
  theme?: "flat" | "light" | "dark"
  /**
   * Additional CSS classes to apply to the root element.
   */
  class?: any
  [key: string]: unknown
}
