import type { UserConfig } from "unocss"
import type { RimelightIcons } from "./icons"

export type Theme = "light" | "dark"
export type ThemeColor =
  | "neutral"
  | "primary"
  | "secondary"
  | "info"
  | "success"
  | "warning"
  | "error"
  | "commentary"
  | "ideation"
  | "source"
  | (string & {})

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
