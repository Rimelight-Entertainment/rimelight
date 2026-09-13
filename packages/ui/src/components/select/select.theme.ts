import { defineTheme } from "../../resolver"

export const selectTheme = defineTheme("select", {
  slots: ["root", "select", "icon", "leading"],
  base: {
    root: "relative inline-flex items-center gap-2 rounded-md",
    select:
      "rl-select bg-transparent outline-none cursor-pointer appearance-none pr-6 text-sm font-medium w-full",
    icon: "pointer-events-none absolute right-2.5 flex items-center text-muted",
    leading: "flex items-center text-muted shrink-0 pointer-events-none"
  },
  variants: {
    variant: {
      default: {
        root: "w-full border border-default bg-default shadow-sm text-highlighted hover:bg-accented/50 transition-colors cursor-pointer",
        select: "text-highlighted"
      },
      icon: {
        root: "inline-flex items-center justify-center rounded-lg border border-default bg-default text-highlighted shadow-sm hover:bg-accented/50 transition-colors cursor-pointer focus-within:ring-2 focus-within:ring-ring",
        select: "absolute inset-0 h-full w-full opacity-0",
        icon: "hidden",
        leading: "pointer-events-none flex items-center justify-center text-current m-0"
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
    { variant: "default", size: "xl", class: { root: "px-4 py-2.5" } },
    { variant: "icon", size: "xs", class: { root: "size-7", leading: "size-7" } },
    { variant: "icon", size: "sm", class: { root: "size-8", leading: "size-8" } },
    { variant: "icon", size: "md", class: { root: "size-9", leading: "size-9" } },
    { variant: "icon", size: "lg", class: { root: "size-10", leading: "size-10" } },
    { variant: "icon", size: "xl", class: { root: "size-11", leading: "size-11" } }
  ],
  defaultVariants: {
    variant: "default",
    size: "md"
  }
})
