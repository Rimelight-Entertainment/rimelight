import { defineTheme } from "../../resolver";

export const RLSelectTheme = defineTheme("select", {
  slots: ["root", "select", "trigger", "leading", "icon", "label", "option", "chevron"],
  base: {
    root: "relative inline-flex items-center",
    select:
      "rl-select w-full rounded-md border shadow-sm transition-colors cursor-pointer focus-within:outline-none",
    trigger: "w-full min-w-0",
    label: "truncate",
    leading: "flex items-center text-current shrink-0 pointer-events-none",
    icon: "shrink-0",
    chevron: "ml-auto shrink-0 size-3.5 text-current",
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
        chevron: "hidden",
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
    {
      layout: "default",
      size: "xs",
      class: { select: "h-[var(--rl-size-control-xs)] px-2 leading-none" },
    },
    {
      layout: "default",
      size: "sm",
      class: { select: "h-[var(--rl-size-control-sm)] px-2.5 leading-none" },
    },
    {
      layout: "default",
      size: "md",
      class: { select: "h-[var(--rl-size-control-md)] px-2.5 leading-none" },
    },
    {
      layout: "default",
      size: "lg",
      class: { select: "h-[var(--rl-size-control-lg)] px-3 leading-none" },
    },
    {
      layout: "default",
      size: "xl",
      class: { select: "h-[var(--rl-size-control-xl)] px-3 leading-none" },
    },
    {
      layout: "icon",
      size: "xs",
      class: { select: "aspect-square h-[var(--rl-size-control-xs)] p-0" },
    },
    {
      layout: "icon",
      size: "sm",
      class: { select: "aspect-square h-[var(--rl-size-control-sm)] p-0" },
    },
    {
      layout: "icon",
      size: "md",
      class: { select: "aspect-square h-[var(--rl-size-control-md)] p-0" },
    },
    {
      layout: "icon",
      size: "lg",
      class: { select: "aspect-square h-[var(--rl-size-control-lg)] p-0" },
    },
    {
      layout: "icon",
      size: "xl",
      class: { select: "aspect-square h-[var(--rl-size-control-xl)] p-0" },
    },
  ],
  defaultVariants: {
    variant: "solid",
    layout: "default",
    color: "primary",
    size: "md",
  },
});
