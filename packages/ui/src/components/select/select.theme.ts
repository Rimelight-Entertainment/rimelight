import { defineTheme } from "../../resolver";

export const RLSelectTheme = defineTheme("select", {
  slots: ["root", "select", "trigger", "leading", "icon", "label", "option"],
  base: {
    root: "relative inline-flex items-center",
    select:
      "rl-select w-full rounded-md border shadow-sm transition-colors cursor-pointer focus-within:outline-none",
    trigger: "flex items-center gap-2 w-full min-w-0 cursor-pointer",
    label: "truncate",
    leading: "flex items-center text-current shrink-0 pointer-events-none",
    icon: "shrink-0",
    option: "bg-default text-highlighted",
  },
  variants: {
    variant: {
      solid: {
        select:
          "border-[var(--rl-border)]/50 bg-default text-highlighted hover:border-[var(--rl-border)] focus-within:ring-2 focus-within:ring-[var(--rl-ring)]",
      },
      outline: {
        select:
          "border-[var(--rl-border)] bg-transparent text-highlighted hover:border-[var(--rl-border)] focus-within:ring-2 focus-within:ring-[var(--rl-ring)]",
      },
      soft: {
        select:
          "border-transparent bg-[var(--rl-bg)]/10 text-highlighted hover:bg-[var(--rl-bg)]/15 focus-within:ring-2 focus-within:ring-[var(--rl-ring)]",
      },
      subtle: {
        select:
          "border-transparent bg-elevated text-highlighted hover:bg-accented focus-within:ring-2 focus-within:ring-[var(--rl-ring)]",
      },
      ghost: {
        select:
          "border-transparent bg-transparent text-highlighted shadow-none hover:bg-elevated focus-within:ring-2 focus-within:ring-[var(--rl-ring)]",
      },
      link: {
        select:
          "border-transparent bg-transparent text-highlighted shadow-none rounded-none px-0 underline underline-offset-4 focus-within:ring-2 focus-within:ring-[var(--rl-ring)]",
      },
    },
    layout: {
      default: {
        root: "w-full",
      },
      icon: {
        select:
          "w-auto rounded-lg focus-within:ring-2 focus-within:ring-[var(--rl-ring)] inline-flex items-center justify-center text-[var(--rl-text)]",
        trigger: "justify-center",
        label: "hidden",
      },
    },
    color: "auto",
    size: {
      xs: { select: "text-xs", label: "text-xs", icon: "size-3.5" },
      sm: { select: "text-xs", label: "text-xs", icon: "size-4" },
      md: { select: "text-sm", label: "text-sm", icon: "size-4" },
      lg: { select: "text-sm", label: "text-sm", icon: "size-5" },
      xl: { select: "text-base", label: "text-base", icon: "size-6" },
    },
  },
  compoundVariants: [
    {
      color: "neutral",
      variant: "solid",
      class: {
        select:
          "border-default bg-default text-highlighted hover:bg-accented/50 hover:border-accented focus-within:ring-2 focus-within:ring-default",
      },
    },
    {
      color: "neutral",
      layout: "icon",
      class: {
        select:
          "border-default bg-default text-highlighted hover:bg-accented/50 hover:border-accented focus-within:ring-2 focus-within:ring-default",
      },
    },
    { layout: "default", size: "xs", class: { select: "px-2 py-1 leading-none" } },
    { layout: "default", size: "sm", class: { select: "px-2.5 py-1.5 leading-none" } },
    { layout: "default", size: "md", class: { select: "px-2.5 py-1.5 leading-none" } },
    { layout: "default", size: "lg", class: { select: "px-3 py-2 leading-none" } },
    { layout: "default", size: "xl", class: { select: "px-3 py-2 leading-none" } },
    { layout: "icon", size: "xs", class: { select: "p-1" } },
    { layout: "icon", size: "sm", class: { select: "p-1.5" } },
    { layout: "icon", size: "md", class: { select: "p-2" } },
    { layout: "icon", size: "lg", class: { select: "p-2.5" } },
    { layout: "icon", size: "xl", class: { select: "p-2" } },
  ],
  defaultVariants: {
    variant: "solid",
    layout: "default",
    color: "primary",
    size: "md",
  },
});
