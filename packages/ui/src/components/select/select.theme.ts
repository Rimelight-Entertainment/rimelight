import { defineTheme } from "../../resolver"

export const selectTheme = defineTheme("select", {
  slots: ["root", "select", "icon", "leading"],
  base: {
    root: "relative inline-flex items-center gap-2 rounded-md border border-default bg-default px-3 py-1.5 text-sm text-highlighted shadow-sm hover:bg-accented/50 transition-colors w-full cursor-pointer",
    select:
      "rl-select bg-transparent outline-none cursor-pointer appearance-none pr-6 text-highlighted text-sm font-medium w-full",
    icon: "pointer-events-none absolute right-2.5 flex items-center text-muted",
    leading: "flex items-center text-muted shrink-0 pointer-events-none"
  },
  variants: {
    size: {
      xs: { root: "px-2 py-0.5 text-xs", select: "text-xs pr-5" },
      sm: { root: "px-2.5 py-1 text-xs", select: "text-xs pr-6" },
      md: { root: "px-3 py-1.5 text-sm", select: "text-sm pr-7" },
      lg: { root: "px-3.5 py-2 text-base", select: "text-base pr-8" },
      xl: { root: "px-4 py-2.5 text-base", select: "text-base pr-9" }
    }
  },
  defaultVariants: {
    size: "md"
  }
})
