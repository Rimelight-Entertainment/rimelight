import { defineTheme } from "../../resolver";

export const RLSelectTheme = defineTheme("select", {
  slots: ["root", "select", "trigger", "leading", "label"],
  base: {
    root: "relative inline-flex items-center",
    select:
      "rl-select w-full rounded-md border shadow-sm transition-colors cursor-pointer focus-within:outline-none",
    trigger: "flex items-center gap-2 w-full min-w-0 cursor-pointer",
    label: "truncate",
    leading: "flex items-center text-current shrink-0 pointer-events-none",
  },
  variants: {
    variant: {
      default: {
        root: "w-full",
        select:
          "border-[var(--rl-border)]/50 bg-default text-highlighted hover:border-[var(--rl-border)] focus-within:ring-2 focus-within:ring-[var(--rl-ring)]",
      },
      icon: {
        select:
          "w-auto rounded-lg focus-within:ring-2 focus-within:ring-[var(--rl-ring)] inline-flex items-center justify-center border-[var(--rl-border)]/60 text-[var(--rl-text)] hover:border-[var(--rl-border)] hover:bg-[var(--rl-bg)]/10",
        trigger: "justify-center",
        label: "hidden",
      },
    },
    color: "auto",
    size: {
      xs: { select: "text-xs", label: "text-xs" },
      sm: { select: "text-xs", label: "text-xs" },
      md: { select: "text-sm", label: "text-sm" },
      lg: { select: "text-base", label: "text-base" },
      xl: { select: "text-base", label: "text-base" },
    },
  },
  compoundVariants: [
    {
      color: "neutral",
      variant: "default",
      class: {
        select:
          "border-default bg-default text-highlighted hover:bg-accented/50 hover:border-accented focus-within:ring-2 focus-within:ring-ring",
      },
    },
    {
      color: "neutral",
      variant: "icon",
      class: {
        select:
          "border-default bg-default text-highlighted hover:bg-accented/50 hover:border-accented focus-within:ring-2 focus-within:ring-ring",
      },
    },
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
    color: "primary",
    size: "md",
  },
});
