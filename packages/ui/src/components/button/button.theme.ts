import { defineTheme } from "../../resolver";

export const buttonTheme = defineTheme("button", {
  slots: [
    "root",
    "label",
    "leadingIcon",
    "leadingAvatar",
    "leadingAvatarSize",
    "trailingIcon",
    "externalHint",
  ],
  base: {
    root: [
      "rounded-md font-medium inline-flex items-center justify-center disabled:cursor-not-allowed aria-disabled:cursor-not-allowed disabled:opacity-75 aria-disabled:opacity-75",
      "transition-colors outline-none select-none no-underline leading-none",
      "aria-invalid:border-error-500 aria-invalid:ring-error-500/20",
    ],
    label: "truncate leading-none",
    leadingIcon: "shrink-0 inline-flex items-center justify-center leading-none",
    leadingAvatar: "shrink-0",
    leadingAvatarSize: "",
    trailingIcon: "shrink-0 inline-flex items-center justify-center leading-none",
    externalHint: "sr-only",
  },
  variants: {
    fieldGroup: {
      horizontal: {
        root: "first:rounded-e-none last:rounded-s-none [&:not(:first-child):not(:last-child)]:rounded-none [&:not(:first-child)]:-ms-px focus-visible:z-[1]",
      },
      vertical: {
        root: "first:rounded-b-none last:rounded-t-none [&:not(:first-child):not(:last-child)]:rounded-none [&:not(:first-child)]:-mt-px focus-visible:z-[1]",
      },
    },
    variant: {
      solid: {
        root: "bg-[var(--rl-bg)] text-inverted hover:bg-[var(--rl-bg-hover)] active:bg-[var(--rl-bg-hover)] disabled:bg-[var(--rl-bg)] aria-disabled:bg-[var(--rl-bg)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rl-ring)]",
      },
      outline: {
        root: "ring ring-inset ring-[var(--rl-border)]/50 text-[var(--rl-text)] hover:bg-[var(--rl-bg)]/10 active:bg-[var(--rl-bg)]/10 disabled:bg-transparent aria-disabled:bg-transparent focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--rl-ring)]",
      },
      soft: {
        root: "text-[var(--rl-text)] bg-[var(--rl-bg)]/10 hover:bg-[var(--rl-bg)]/15 active:bg-[var(--rl-bg)]/15 focus:outline-none focus-visible:bg-[var(--rl-bg)]/15 disabled:bg-[var(--rl-bg)]/10 aria-disabled:bg-[var(--rl-bg)]/10",
      },
      subtle: {
        root: "text-[var(--rl-text)] ring ring-inset ring-[var(--rl-border)]/25 bg-[var(--rl-bg)]/10 hover:bg-[var(--rl-bg)]/15 active:bg-[var(--rl-bg)]/15 disabled:bg-[var(--rl-bg)]/10 aria-disabled:bg-[var(--rl-bg)]/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--rl-ring)]",
      },
      ghost: {
        root: "text-[var(--rl-text)] hover:bg-[var(--rl-bg)]/10 active:bg-[var(--rl-bg)]/10 focus:outline-none focus-visible:bg-[var(--rl-bg)]/10 disabled:bg-transparent aria-disabled:bg-transparent",
      },
      link: {
        root: "text-[var(--rl-text)] hover:text-[var(--rl-text)]/75 active:text-[var(--rl-text)]/75 disabled:text-[var(--rl-text)] aria-disabled:text-[var(--rl-text)] focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--rl-ring)]",
      },
    },
    color: "auto",
    size: {
      xs: {
        root: "text-xs gap-1 leading-none",
        leadingIcon: "size-4",
        leadingAvatarSize: "3xs",
        trailingIcon: "size-4",
      },
      sm: {
        root: "text-xs gap-1.5 leading-none",
        leadingIcon: "size-4",
        leadingAvatarSize: "3xs",
        trailingIcon: "size-4",
      },
      md: {
        root: "text-sm gap-1.5 leading-none",
        leadingIcon: "size-5",
        leadingAvatarSize: "2xs",
        trailingIcon: "size-5",
      },
      lg: {
        root: "text-sm gap-2 leading-none",
        leadingIcon: "size-5",
        leadingAvatarSize: "2xs",
        trailingIcon: "size-5",
      },
      xl: {
        root: "text-base gap-2 leading-none",
        leadingIcon: "size-6",
        leadingAvatarSize: "xs",
        trailingIcon: "size-6",
      },
    },
    justify: {
      start: { root: "justify-start" },
      center: { root: "justify-center" },
      end: { root: "justify-end" },
      between: { root: "justify-between" },
      around: { root: "justify-around" },
      evenly: { root: "justify-evenly" },
    },
    block: {
      true: { root: "w-full justify-center", trailingIcon: "ms-auto" },
    },
    square: {
      true: { root: "aspect-square justify-center" },
      false: {},
    },
    rounded: {
      true: { root: "rounded-full" },
      false: { root: "rounded-md" },
    },
    leading: { true: {} },
    trailing: { true: {} },
    loading: { true: {} },
    active: {
      true: { root: "" },
      false: { root: "" },
    },
  },
  compoundVariants: [
    {
      color: "neutral",
      variant: "solid",
      classNames: {
        root: "text-inverted bg-inverted hover:bg-inverted/90 active:bg-inverted/90 disabled:bg-inverted aria-disabled:bg-inverted focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-inverted",
      },
    },
    {
      color: "neutral",
      variant: "outline",
      classNames: {
        root: "ring ring-inset ring-accented text-default bg-default hover:bg-elevated active:bg-elevated disabled:bg-default aria-disabled:bg-default focus:outline-none focus-visible:ring-2 focus-visible:ring-inverted",
      },
    },
    {
      color: "neutral",
      variant: "soft",
      classNames: {
        root: "text-default bg-elevated hover:bg-accented/75 active:bg-accented/75 focus:outline-none focus-visible:bg-accented/75 disabled:bg-elevated aria-disabled:bg-elevated",
      },
    },
    {
      color: "neutral",
      variant: "subtle",
      classNames: {
        root: "ring ring-inset ring-accented text-default bg-elevated hover:bg-accented/75 active:bg-accented/75 disabled:bg-elevated aria-disabled:bg-elevated focus:outline-none focus-visible:ring-2 focus-visible:ring-inverted",
      },
    },
    {
      color: "neutral",
      variant: "ghost",
      classNames: {
        root: "text-default hover:bg-elevated active:bg-elevated focus:outline-none focus-visible:bg-elevated hover:disabled:bg-transparent hover:aria-disabled:bg-transparent",
      },
    },
    {
      color: "neutral",
      variant: "link",
      classNames: {
        root: "text-muted hover:text-default active:text-default disabled:text-muted aria-disabled:text-muted focus:outline-none focus-visible:ring-inset focus-visible:ring-2 focus-visible:ring-inverted",
      },
    },
    { square: false, size: "xs", classNames: { root: "px-2 py-1" } },
    { square: true, size: "xs", classNames: { root: "p-1" } },
    { square: false, size: "sm", classNames: { root: "px-2.5 py-1.5" } },
    { square: true, size: "sm", classNames: { root: "p-1.5" } },
    { square: false, size: "md", classNames: { root: "px-2.5 py-1.5" } },
    { square: true, size: "md", classNames: { root: "p-1.5" } },
    { square: false, size: "lg", classNames: { root: "px-3 py-2" } },
    { square: true, size: "lg", classNames: { root: "p-2" } },
    { square: false, size: "xl", classNames: { root: "px-3 py-2" } },
    { square: true, size: "xl", classNames: { root: "p-2" } },
    {
      loading: true,
      leading: true,
      classNames: {
        leadingIcon: "animate-spin",
      },
    },
    {
      loading: true,
      leading: false,
      trailing: true,
      classNames: {
        trailingIcon: "animate-spin",
      },
    },
    {
      loading: true,
      trailing: true,
      classNames: {
        trailingIcon: "animate-spin",
      },
    },
  ],
  defaultVariants: {
    variant: "solid",
    color: "primary",
    size: "md",
    justify: "center",
    rounded: false,
  },
});
