export interface ComponentTheme {
  slots: string[]
  base: Record<string, string | string[]>
  variants?: Record<string, Record<string, Record<string, string | string[]>>>
  compoundVariants?: Record<string, unknown>[]
  defaultVariants?: Record<string, unknown>
}

export function defineTheme<const T extends ComponentTheme>(theme: T): T {
  return theme
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

export type ComponentThemeProps<
  T extends { slots: readonly string[]; variants?: Record<string, Record<string, unknown>> }
> = ComponentVariants<T> & {
  ui?: ComponentSlots<T>
}
