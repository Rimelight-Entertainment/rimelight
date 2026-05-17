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