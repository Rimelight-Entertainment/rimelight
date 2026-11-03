import { defineTheme } from "../../resolver";

export const RLBadgeTheme = defineTheme("badge", {
  slots: ["root", "label", "leadingIcon", "leadingAvatar", "leadingAvatarSize", "trailingIcon"],
  base: {
    root: "font-medium inline-flex items-center transition-all duration-150 select-none",
    label: "truncate",
    leadingIcon: "shrink-0",
    leadingAvatar: "shrink-0",
    leadingAvatarSize: "",
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
      xs: { root: "text-[8px]/3 gap-1", leadingAvatarSize: "xs" },
      sm: { root: "text-[10px]/3 gap-1", leadingAvatarSize: "xs" },
      md: { root: "text-xs gap-1", leadingAvatarSize: "xs" },
      lg: { root: "text-sm gap-1.5", leadingAvatarSize: "xs" },
      xl: { root: "text-base gap-1.5", leadingAvatarSize: "xs" },
    },
    shape: {
      square: { root: "rounded-none" },
      rounded: { root: "rounded-md" },
      pill: { root: "rounded-full" },
    },
    square: {
      true: { root: "justify-center" },
      false: { root: "" },
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
    // Non-square horizontal & vertical padding per size
    {
      size: "xs",
      square: false,
      class: { root: "px-1 py-0.5" },
    },
    {
      size: "sm",
      square: false,
      class: { root: "px-1.5 py-1" },
    },
    {
      size: "md",
      square: false,
      class: { root: "px-2 py-1" },
    },
    {
      size: "lg",
      square: false,
      class: { root: "px-2 py-1" },
    },
    {
      size: "xl",
      square: false,
      class: { root: "px-2.5 py-1" },
    },
    // Square equal padding and min-width per size
    {
      size: "xs",
      square: true,
      class: { root: "p-0.5 min-w-4" },
    },
    {
      size: "sm",
      square: true,
      class: { root: "p-1 min-w-5" },
    },
    {
      size: "md",
      square: true,
      class: { root: "p-1 min-w-6" },
    },
    {
      size: "lg",
      square: true,
      class: { root: "p-1 min-w-7" },
    },
    {
      size: "xl",
      square: true,
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
    square: false,
  },
});
