import type { UserConfig } from "unocss"
import type { RimelightIcons } from "./icons/defaults"

export const colorNames = [
  "neutral",
  "primary",
  "secondary",
  "info",
  "success",
  "warning",
  "error",
  "commentary",
  "ideation",
  "source"
] as const

export type Theme = "light" | "dark"
export type ThemeColor = (typeof colorNames)[number] | (string & {})

export interface PresetOptions {
  /**
   * Custom colors.
   */
  colors?: Record<
    string,
    Record<string, string> | { light?: Record<string, string>; dark?: Record<string, string> }
  >
  /**
   * Global icon overrides mapping icon names to class names (e.g. `i-lucide-x`) or raw SVG strings.
   */
  icons?: RimelightIcons
  /**
   * Configure which built-in UnoCSS presets are enabled/disabled.
   */
  presets?: {
    wind?: boolean
    typography?: boolean
    icons?: boolean
  }
}

export interface UIConfig extends PresetOptions {
  /**
   * Whether to strip default theme classes from all components (bringing your own styling).
   */
  unstyled?: boolean
  /**
   * Configuration for keyboard shortcuts.
   */
  shortcuts?: {
    categories?: Record<string, { label: string }>
  }
  /**
   * Configuration for the Logo component variants.
   */
  logos?: Record<
    string,
    | string
    | {
        light?: string
        dark?: string
        color?: string
        white?: string
        black?: string
        [key: string]: string | undefined
      }
  >
  /**
   * Global component configuration overrides.
   */
  components?: {
    /**
     * Global UI overrides applied to all components. Merged with defaults via our custom recursive
     * merge utility (first arg wins). Values follow the css-variants theme override format.
     */
    themes?: Record<
      string,
      {
        slots?: Record<string, string | ((base: string) => string) | undefined>
        [key: string]: unknown
      }
    >
  }
  /**
   * Custom UnoCSS configuration overrides, routed directly down to the UnoCSS instance.
   */
  unocss?: UserConfig
}
