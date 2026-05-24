export interface ThemeSelectorProps {
    /**
     * The size of the button.
     */
    size?: "xs" | "sm" | "md" | "lg" | "xl";
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
