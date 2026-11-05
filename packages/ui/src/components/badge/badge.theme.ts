import { defineTheme } from "../../resolver";

export const RLBadgeTheme = defineTheme("badge", {
  slots: [
    "root",
    "label",
    "leadingSlot",
    "leadingIcon",
    "leadingAvatar",
    "trailingSlot",
    "trailingIcon",
  ],
  base: {
    root: "font-medium inline-flex items-center transition-all duration-150 select-none",
    label: "truncate",
    leadingSlot: "inline-flex items-center shrink-0",
    leadingIcon: "shrink-0",
    leadingAvatar: "shrink-0",
    trailingSlot: "inline-flex items-center shrink-0",
    trailingIcon: "shrink-0",
  },
  variants: {
    fieldGroup: {
      horizontal: {
        root: "not-only:first:rounded-e-none not-only:last:rounded-s-none not-last:not-first:rounded-none focus-visible:z-[1]",
      },
      vertical: {
        root: "not-only:first:rounded-b-none not-only:last:rounded-t-none not-last:not-first:rounded-none focus-visible:z-[1]",
      },
    },
    variant: {
      solid: { root: "bg-[var(--rl-bg)] text-inverted" },
      outline: { root: "text-[var(--rl-text)] ring ring-inset ring-[var(--rl-border)]/50" },
      soft: { root: "bg-[var(--rl-bg)]/10 text-[var(--rl-text)]" },
      subtle: {
        root: "bg-[var(--rl-bg)]/10 text-[var(--rl-text)] ring ring-inset ring-[var(--rl-border)]/25",
      },
      ghost: {
        root: "text-[var(--rl-text)] bg-transparent",
      },
    },
    color: "auto",
    size: {
      xs: { root: "text-xs gap-1" },
      sm: { root: "text-xs gap-1" },
      md: { root: "text-sm gap-1" },
      lg: { root: "text-sm gap-1.5" },
      xl: { root: "text-base gap-1.5" },
    },
    shape: {
      square: { root: "rounded-none justify-center" },
      rounded: { root: "rounded-md" },
      pill: { root: "rounded-full" },
    },
  },
  compoundVariants: [
    {
      color: "neutral",
      variant: "solid",
      class: {
        root: "text-inverted bg-inverted",
      },
    },
    {
      color: "neutral",
      variant: "outline",
      class: {
        root: "ring ring-inset ring-accented text-default bg-default",
      },
    },
    {
      color: "neutral",
      variant: "soft",
      class: {
        root: "text-default bg-elevated",
      },
    },
    {
      color: "neutral",
      variant: "subtle",
      class: {
        root: "ring ring-inset ring-accented text-default bg-elevated",
      },
    },
    {
      color: "neutral",
      variant: "ghost",
      class: {
        root: "text-default bg-transparent",
      },
    },
    // Rounded and pill padding per size
    {
      size: "xs",
      shape: ["rounded", "pill"],
      class: { root: "px-1 py-0.5" },
    },
    {
      size: "sm",
      shape: ["rounded", "pill"],
      class: { root: "px-1.5 py-1" },
    },
    {
      size: "md",
      shape: ["rounded", "pill"],
      class: { root: "px-2 py-1" },
    },
    {
      size: "lg",
      shape: ["rounded", "pill"],
      class: { root: "px-2 py-1" },
    },
    {
      size: "xl",
      shape: ["rounded", "pill"],
      class: { root: "px-2.5 py-1" },
    },
    // Square equal padding and min-width per size
    {
      size: "xs",
      shape: "square",
      class: { root: "p-0.5 min-w-4" },
    },
    {
      size: "sm",
      shape: "square",
      class: { root: "p-1 min-w-5" },
    },
    {
      size: "md",
      shape: "square",
      class: { root: "p-1 min-w-6" },
    },
    {
      size: "lg",
      shape: "square",
      class: { root: "p-1 min-w-7" },
    },
    {
      size: "xl",
      shape: "square",
      class: { root: "p-1 min-w-8" },
    },
    // Rounded shape refinement for small sizes
    {
      size: "xs",
      shape: "rounded",
      class: { root: "rounded-sm" },
    },
    {
      size: "sm",
      shape: "rounded",
      class: { root: "rounded-sm" },
    },
  ],
  defaultVariants: {
    variant: "solid",
    color: "primary",
    size: "md",
    shape: "rounded",
  },
});
