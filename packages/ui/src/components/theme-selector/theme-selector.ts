export interface ThemeSelectorProps {
  /**
   * The display mode of the theme selector.
   *
   * @default "select"
   */
  mode?: "select" | "icon"
  /**
   * The size of the select/button.
   */
  size?: "xs" | "sm" | "md" | "lg" | "xl"
  /**
   * Theme variant/mode.
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
