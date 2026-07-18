import type { colorConfig } from "../config/color.config"

export type Theme = "light" | "dark"

export type ThemeColor = (typeof colorConfig.colors)[number] | (string & {})

export interface ComponentTheme {
  slots: string[]
  base: Record<string, string | string[]>
  variants?: Record<string, Record<string, Record<string, string | string[]>>>
  compoundVariants?: any[]
  defaultVariants?: Record<string, unknown>
}

export function defineTheme<const T extends ComponentTheme>(theme: T): T {
  return theme
}
