import { defineTheme } from "../../resolver"

export const selectTheme = defineTheme("select", {
  slots: ["root", "select", "icon", "leading"],
  base: {
    root: "relative inline-flex items-center gap-2",
    select:
      "rl-select bg-transparent outline-none cursor-pointer appearance-none pr-6 text-sm font-medium w-full",
    icon: "pointer-events-none absolute right-2.5 flex items-center text-muted",
    leading: "flex items-center text-muted shrink-0 pointer-events-none"
  },
  variants: {
    variant: {
      default: {
        root: "w-full rounded-md border border-default bg-default shadow-sm text-highlighted hover:bg-accented/50 transition-colors cursor-pointer",
        select: "text-highlighted"
      },
      icon: {
        root: "rounded-lg focus-within:ring-2 focus-within:ring-ring",
        select: "absolute inset-0 h-full w-full opacity-0 cursor-pointer",
        icon: "hidden",
        leading: "hidden"
      }
    },
    size: {
      xs: { root: "text-xs", select: "text-xs pr-5" },
      sm: { root: "text-xs", select: "text-xs pr-6" },
      md: { root: "text-sm", select: "text-sm pr-7" },
      lg: { root: "text-base", select: "text-base pr-8" },
      xl: { root: "text-base", select: "text-base pr-9" }
    }
  },
  compoundVariants: [
    { variant: "default", size: "xs", class: { root: "px-2 py-0.5" } },
    { variant: "default", size: "sm", class: { root: "px-2.5 py-1" } },
    { variant: "default", size: "md", class: { root: "px-3 py-1.5" } },
    { variant: "default", size: "lg", class: { root: "px-3.5 py-2" } },
    { variant: "default", size: "xl", class: { root: "px-4 py-2.5" } }
  ],
  defaultVariants: {
    variant: "default",
    size: "md"
  }
})
