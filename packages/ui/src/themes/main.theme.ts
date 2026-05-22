import { defineTheme } from "../utils/defineTheme"

export default defineTheme({
    slots: [
        "root"
    ],
    base: {
        root: "min-h-[calc(100vh-var(--ui-header-height))]"
    },
    variants: {},
    defaultVariants: {}
})
