import { defineTheme } from "../utils/defineTheme"

export default defineTheme({
    slots: [
        "root",
        "sun",
        "moon"
    ],
    base: {
        root: "group rounded-full hover:bg-neutral-900/50 transition-colors inline-flex items-center justify-center text-neutral-400 hover:text-white cursor-pointer",
        sun: "dark:hidden i-lucide-sun w-5 h-5 text-current",
        moon: "hidden dark:block i-lucide-moon w-5 h-5 text-current"
    },
    variants: {},
    defaultVariants: {}
})