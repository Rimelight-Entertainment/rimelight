import type { UserConfig } from "unocss"
import type { RimelightIcons } from "./icons"
import type { P } from "./preset"

export type Theme = "light" | "dark"
export type BuiltinThemeColor = keyof typeof P
export type ThemeColor = BuiltinThemeColor | (string & {})

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
        base?: string | string[] | Record<string, string | string[]>
        variants?: Record<
          string,
          Record<string, string | string[] | Record<string, string | string[]>>
        >
        compoundVariants?: Array<Record<string, any>>
        defaultVariants?: Record<string, any>
        [key: string]: unknown
      }
    >
  }
  /**
   * Custom UnoCSS configuration overrides.
   */
  unocss?: UserConfig
}
