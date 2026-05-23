import { defineTheme } from "../utils/defineTheme"

export const kbdTheme = defineTheme({
  slots: ["root"],
  base: {
    root: [
      "inline-flex items-center justify-center font-sans font-medium select-none pointer-events-none rounded border border-border bg-muted",
      "shadow-[0_1px_0px_0px_rgba(0,0,0,0.1)] dark:shadow-[0_1px_0px_0px_rgba(255,255,255,0.05)]",
      "text-muted-foreground"
    ]
  },
  variants: {
    size: {
      sm: { root: "h-5 min-w-[20px] px-1 text-3xs" },
      md: { root: "h-6 min-w-[24px] px-1.5 text-2xs" },
      lg: { root: "h-7 min-w-[28px] px-2 text-xs" }
    }
  },
  defaultVariants: {
    size: "md"
  }
})

export default kbdTheme
