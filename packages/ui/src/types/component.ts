export interface ComponentTheme {
  slots: readonly string[]
  base: Record<string, unknown>
  variants?: Record<string, Record<string, unknown>>
  compoundVariants?: unknown[]
  defaultVariants?: Record<string, unknown>
}

export function defineTheme<const T extends ComponentTheme>(
  theme: T
): T & { slots: T["slots"][number][] }
export function defineTheme(theme: ComponentTheme) {
  return theme
}
