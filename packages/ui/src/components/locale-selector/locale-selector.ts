export interface LocaleItem {
  code: string
  label: string
  /**
   * The URL to navigate to when this locale is selected.
   *
   * Supply this to make the component fully routing-agnostic: it will use `href` directly and will
   * not call any Astro i18n APIs. The caller is responsible for constructing URLs using whatever
   * strategy their project uses — `getRelativeLocaleUrl`, `@rimelight/i18n`, a custom helper, or a
   * plain string.
   *
   * When omitted the component falls back to computing the URL via Astro's built-in
   * `getRelativeLocaleUrl` helper (requires Astro i18n to be configured).
   */
  href?: string
}

export interface LocaleSelectorProps {
  /**
   * Array of available locales to display in the selector.
   *
   * Accepts plain locale code strings (`"en"`, `"pt"`) or full `LocaleItem` objects. Supply an
   * `href` on each `LocaleItem` to make the component fully routing-agnostic — when every item has
   * an `href` the component no longer depends on Astro's i18n APIs at all.
   *
   * When omitted the component auto-detects available locales from `getRelativeLocaleUrlList()`
   * (requires Astro i18n).
   */
  locales?: string[] | LocaleItem[]
  /**
   * The currently active locale code. Used to pre-select the right option in the dropdown.
   *
   * When omitted the component falls back to `Astro.currentLocale`, which requires Astro's i18n
   * middleware to be running. Pass this prop explicitly when your project manages locale state
   * outside of Astro's built-in routing.
   */
  currentLocale?: string
  /**
   * The styling variant of the language selection element.
   *
   * @default "default"
   */
  variant?: "default" | "outline" | "ghost"
  /**
   * The size scale of typography and spacing metrics.
   *
   * @default "md"
   */
  size?: "sm" | "md" | "lg"
  /**
   * The color theme mode override for this component.
   */
  theme?: "light" | "dark"
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
