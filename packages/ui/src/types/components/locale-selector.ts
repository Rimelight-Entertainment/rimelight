export interface LocaleItem {
    code: string;
    label: string;
}

export interface LocaleSelectorProps {
    /**
     * Array of available system locales to feed down to the selection interface view layer.
     * Can pass plain code string lists or object mapping items.
     */
    locales?: string[] | LocaleItem[]
    /**
     * The styling variant of the language selection element.
     *
     * @default "default"
     */
    variant?: "default" | "outline" | "ghost"
    /**
     * The size scale of typography and spacing metrics.
     *
     * @default "md"
     */
    size?: "sm" | "md" | "lg"
    /**
     * Slot-specific CSS class overrides.
     */
    ui?: any
    /**
     * Additional CSS classes to apply to the root element.
     */
    class?: any
    [key: string]: unknown
}
