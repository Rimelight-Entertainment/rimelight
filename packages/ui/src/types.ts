import type { UserConfig } from "unocss"
import type { RimelightIcons } from "./icons"
import type { PALETTES } from "./preset"

export type Theme = "light" | "dark"
export type BuiltinThemeColor = keyof typeof PALETTES
export type ThemeColor = BuiltinThemeColor | (string & {})

export type ClassValue =
  | string
  | number
  | boolean
  | undefined
  | null
  | { [key: string]: any }
  | ClassValue[]

export interface ThemeConfig<S extends string = string> {
  slots?: readonly S[] | S[]
  base?: Partial<Record<S, ClassValue>>
  variants?: Record<string, any>
  compoundVariants?: Array<
    Record<string, any> & {
      classNames?: Partial<Record<S, ClassValue>>
      class?: Partial<Record<S, ClassValue>>
    }
  >
  defaultVariants?: Record<string, any>
}

export type ColorModeInput =
  | [chroma: number, hue: number]
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
    themes?: Record<string, ThemeConfig<string>>
  }
  /**
   * Custom UnoCSS configuration overrides.
   */
  unocss?: UserConfig
}
