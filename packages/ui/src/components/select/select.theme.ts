import { defineTheme } from "../../resolver"

export const selectTheme = defineTheme("select", {
  slots: ["root", "select", "icon", "leading", "label"],
  base: {
    root: "relative inline-flex items-center gap-2",
    select: "rl-select appearance-none absolute inset-0 h-full w-full opacity-0 cursor-pointer",
    label: "text-sm font-medium",
    icon: "pointer-events-none absolute inset-y-0 right-2.5 flex items-center text-current",
    leading: "flex items-center text-current shrink-0 pointer-events-none self-center"
  },
  variants: {
    variant: {
      default: {
        root: "w-full rounded-md border border-default bg-default shadow-sm text-highlighted hover:bg-accented/50 transition-colors cursor-pointer"
      },
      icon: {
        root: "rounded-lg focus-within:ring-2 focus-within:ring-ring",
        label: "hidden",
        icon: "hidden",
        leading: "hidden"
      }
    },
    size: {
      xs: { root: "text-xs", label: "text-xs pr-5" },
      sm: { root: "text-xs", label: "text-xs pr-6" },
      md: { root: "text-sm", label: "text-sm pr-7" },
      lg: { root: "text-base", label: "text-base pr-8" },
      xl: { root: "text-base", label: "text-base pr-9" }
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
