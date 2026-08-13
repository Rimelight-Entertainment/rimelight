import type { colorScales } from "../config/color.config"

export type Theme = "light" | "dark"

export type ThemeColor = keyof typeof colorScales | (string & {})

export type ColorShades = Record<string, string>

export interface ColorModeScale {
  light?: ColorShades
  dark?: ColorShades
}

export type ColorScale = ColorShades | ColorModeScale

export interface ComponentTheme {
  slots: string[]
  base: Record<string, string | string[]>
  variants?: Record<string, Record<string, Record<string, string | string[]>>>
  compoundVariants?: any[]
  defaultVariants?: Record<string, unknown>
}

export type ComponentVariants<T extends { variants?: Record<string, Record<string, unknown>> }> =
  T["variants"] extends Record<string, Record<string, unknown>>
    ? {
        [K in keyof T["variants"]]?: T["variants"][K] extends { true: unknown; false: unknown }
          ? boolean
          : T["variants"][K] extends { true: unknown }
            ? boolean
            : keyof T["variants"][K]
      }
    : never

export type ComponentSlots<T extends { slots: readonly string[] }> = Partial<
  Record<T["slots"][number], string>
>
