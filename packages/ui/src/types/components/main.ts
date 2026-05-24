export interface MainProps {
    /**
     * The element or component this component should render as.
     *
     * @default "main"
     */
    as?: any
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
