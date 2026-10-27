import { defineTheme } from "../../resolver";

export const RLSelectTheme = defineTheme("select", {
  slots: ["root", "select", "trigger", "leading", "label"],
  base: {
    root: "relative inline-flex items-center",
    select:
      "rl-select w-full rounded-md border border-default bg-default shadow-sm text-highlighted hover:bg-accented/50 transition-colors cursor-pointer",
    trigger: "flex items-center gap-2 w-full min-w-0 cursor-pointer",
    label: "truncate",
    leading: "flex items-center text-current shrink-0 pointer-events-none",
  },
  variants: {
    variant: {
      default: {
        root: "w-full",
      },
      icon: {
        select: "w-auto rounded-lg focus-within:ring-2 focus-within:ring-ring",
        trigger: "justify-center",
        label: "hidden",
      },
    },
    size: {
      xs: { select: "text-xs", label: "text-xs" },
      sm: { select: "text-xs", label: "text-xs" },
      md: { select: "text-sm", label: "text-sm" },
      lg: { select: "text-base", label: "text-base" },
      xl: { select: "text-base", label: "text-base" },
    },
  },
  compoundVariants: [
    { variant: "default", size: "xs", class: { select: "px-2 py-0.5" } },
    { variant: "default", size: "sm", class: { select: "px-2.5 py-1" } },
    { variant: "default", size: "md", class: { select: "px-3 py-1.5" } },
    { variant: "default", size: "lg", class: { select: "px-3.5 py-2" } },
    { variant: "default", size: "xl", class: { select: "px-4 py-2.5" } },
    { variant: "icon", size: "xs", class: { select: "p-1" } },
    { variant: "icon", size: "sm", class: { select: "p-1.5" } },
    { variant: "icon", size: "md", class: { select: "p-2" } },
    { variant: "icon", size: "lg", class: { select: "p-2.5" } },
    { variant: "icon", size: "xl", class: { select: "p-3" } },
  ],
  defaultVariants: {
    variant: "default",
    size: "md",
  },
});
