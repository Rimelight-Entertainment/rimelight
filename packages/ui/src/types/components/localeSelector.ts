export interface LocaleSelectorProps {
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
     * Slot-specific CSS class overrides for deeper structural modifications.
     */
    ui?: any
    /**
     * Additional CSS classes to apply to the root wrapper element.
     */
    class?: any
    [key: string]: unknown
}