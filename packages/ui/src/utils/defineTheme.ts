export function defineTheme<
    const T extends {
        slots: string[]
        base: Record<string, string | string[]>
        variants?: Record<string, Record<string, Record<string, string | string[]>>>
        compoundVariants?: Record<string, unknown>[]
        defaultVariants?: Record<string, unknown>
    }
>(theme: T): T {
    return theme
}