import { defineTheme } from "../utils/defineTheme"

export default defineTheme({
    slots: [
        "root",
        "label",
        "wrapper",
        "select",
        "option",
        "iconWrapper"
    ],
    base: {
        root: "inline-flex flex-col gap-1.5",
        label: "text-xs font-semibold text-muted select-none",
        wrapper: "relative inline-block w-full",
        select: "w-full appearance-none font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer",
        option: "bg-default text-default",
        iconWrapper: "pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2 text-muted"
    },
    variants: {
        variant: {
            default: {
                select: "bg-gray-100 text-gray-700 hover:bg-gray-200"
            },
            outline: {
                select: "bg-transparent border border-default text-default hover:bg-muted/30"
            },
            ghost: {
                select: "bg-transparent text-default hover:bg-muted/50"
            }
        },
        size: {
            sm: {
                label: "text-xxs",
                select: "text-xs px-3 py-1.5 pr-7"
            },
            md: {
                label: "text-xs",
                select: "text-sm px-4 py-2 pr-8"
            },
            lg: {
                label: "text-sm",
                select: "text-base px-5 py-2.5 pr-10"
            }
        }
    },
    defaultVariants: {
        variant: "default",
        size: "md"
    }
})