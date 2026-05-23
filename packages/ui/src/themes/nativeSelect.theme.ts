import { defineTheme } from "../utils/defineTheme"

export const createNativeSelectTheme = () =>
  defineTheme({
    slots: ["root", "label", "select", "icon"],
    base: {
      root: "relative w-full flex flex-col gap-1.5",
      label: "text-sm font-medium text-foreground",
      select: "flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none pr-10",
      icon: "pointer-events-none absolute right-3 top-[calc(50%+4px)] size-4 text-muted-foreground transform -translate-y-1/2"
    },
    variants: {
      size: {
        sm: { select: "h-8 text-xs px-2 pr-8" },
        md: { select: "h-9 text-sm px-3 pr-10" },
        lg: { select: "h-10 text-base px-4 pr-12" }
      }
    },
    defaultVariants: {
      size: "md"
    }
  })

export default createNativeSelectTheme()
