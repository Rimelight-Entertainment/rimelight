import type { Theme } from "../../types/component"

export interface LinkProps {
  /**
   * The text label displayed inside the link. Alternative to passing children via the default slot.
   */
  label?: string
  /**
   * Icon name displayed before the link label.
   */
  leadingIcon?: string
  /**
   * Icon name displayed after the link label. Replaces the external icon when set.
   */
  trailingIcon?: string
  /**
   * The URL the link points to.
   */
  href?: string
  /**
   * Forces the link to be treated as an external link.
   *
   * @default false
   */
  external?: boolean
  /**
   * Custom external link icon name.
   *
   * @default "externalLink"
   */
  externalIcon?: string
  /**
   * Suppress the automatic external link icon.
   *
   * @default false
   */
  noExternalIcon?: boolean
  /**
   * Where to open the linked URL. External links default to `"_blank"`.
   *
   * @default undefined
   */
  target?: string
  /**
   * Relationship of the linked URL. External links default to `"noopener noreferrer"`. Set to empty
   * string to suppress the attribute entirely.
   *
   * @default undefined
   */
  rel?: string | null
  /**
   * Enables Astro's built-in prefetch strategy.
   *
   * @default undefined;
   */
  prefetch?: boolean | "hover" | "tap" | "load" | "viewport"
  /**
   * Auto-localizes the href when Astro i18n is configured. Pass `false` to disable, or a locale
   * code (e.g. `"pt"`) to localize to a specific language.
   *
   * @default undefined
   */
  locale?: boolean | string
  /**
   * Applies active styling to the link.
   *
   * @default undefined
   */
  active?: boolean
  /**
   * Only matches the link as active if the path is an exact match.
   *
   * @default false
   */
  exact?: boolean
  /**
   * Disables the link, preventing navigation and applying disabled styling.
   *
   * @default false
   */
  disabled?: boolean
  /**
   * When true, only `class` is applied — all default theme styles are skipped.
   *
   * @default false
   */
  raw?: boolean
  /**
   * Screen reader accessibility label. When omitted on external links, "(opens in a new tab)" is
   * appended automatically.
   */
  ariaLabel?: string
  /**
   * The value of `aria-current` when the link is the active/current page.
   *
   * @default "page"
   */
  ariaCurrentValue?: "page" | "step" | "location" | "date" | "time" | "true" | "false" | boolean
  /**
   * Force a color-scheme context on the component.
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
