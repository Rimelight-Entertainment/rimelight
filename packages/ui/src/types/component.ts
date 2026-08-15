export interface ComponentTheme {
  slots: readonly string[]
  base: Record<string, unknown>
  variants?: Record<string, Record<string, unknown>>
  compoundVariants?: unknown[]
  defaultVariants?: Record<string, unknown>
}

export const defineTheme = <const T extends ComponentTheme>(
  theme: T
): T & { slots: T["slots"][number][] } => ({ ...theme, slots: [...theme.slots] })
