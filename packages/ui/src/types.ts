import type { UserConfig } from "unocss"
import type { RimelightIcons } from "./icons"

export const PALETTES = {
  neutral: [0, 0],
  primary: [0.21, 260],
  secondary: [0.18, 70],
  info: [0.24, 260],
  success: [0.2, 150],
  warning: [0.17, 86],
  error: [0.24, 25],
  commentary: [0.29, 322],
  ideation: [0.28, 293],
  source: [0.13, 215]
} as const

export type Theme = "light" | "dark"
export type ThemeColor = keyof typeof PALETTES | (string & {})
export type ColorModeInput =
  | Record<string, string>
  | { light?: Record<string, string>; dark?: Record<string, string> }

export interface PresetOptions {
  /**
   * Custom colors.
   */
  colors?: Record<string, ColorModeInput>
  /**
   * Global icon overrides mapping icon names to class names (e.g. `i-lucide-x`) or raw SVG strings.
   */
  icons?: RimelightIcons
  /**
   * Configure which built-in UnoCSS presets are enabled/disabled.
   */
  presets?: { wind?: boolean; typography?: boolean; icons?: boolean }
}

export interface UIConfig extends PresetOptions {
  /**
   * Whether to strip default theme classes from all components.
   */
  unstyled?: boolean
  /**
   * Configuration for keyboard shortcuts.
   */
  shortcuts?: { categories?: Record<string, { label: string }> }
  /**
   * Configuration for the Logo component variants.
   */
  logos?: Record<string, string | Record<string, string | undefined>>
  /**
   * Global component configuration overrides.
   */
  components?: {
    themes?: Record<
      string,
      {
        slots?: Record<string, string | ((base: string) => string) | undefined>
        [key: string]: unknown
      }
    >
  }
  /**
   * Custom UnoCSS configuration overrides.
   */
  unocss?: UserConfig
}
