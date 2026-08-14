import type { Override } from "../config"

export interface ComponentTheme {
  slots: readonly string[] | string[]
  base: Record<string, unknown>
  variants?: Record<string, Record<string, unknown>>
  compoundVariants?: unknown[]
  defaultVariants?: Record<string, unknown>
}

export const defineTheme = <const T extends ComponentTheme>(theme: T): T => theme

export type ComponentVariants<T> = T extends { variants?: infer V }
  ? { [K in keyof V]?: V[K] extends { true: unknown } ? boolean : keyof V[K] }
  : {}

export type ComponentSlots<T> = T extends { slots: readonly (infer S)[] | (infer S)[] }
  ? Partial<Record<Extract<S, string>, Override>>
  : {}

export type ComponentThemeProps<T> = ComponentVariants<T> & { ui?: ComponentSlots<T> }
