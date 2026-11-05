import { defineTheme } from "../../resolver";

export const RLCheckboxTheme = defineTheme("checkbox", {
  slots: [
    "root",
    "container",
    "input",
    "base",
    "indicator",
    "icon",
    "wrapper",
    "label",
    "description",
  ],
  base: {
    root: "relative flex items-start cursor-pointer select-none",
    container: "flex items-center",
    input: "sr-only peer",
    base: "rounded-sm ring-1 ring-inset ring-accented focus-visible:outline-none bg-default transition-all duration-150 shrink-0",
    indicator:
      "flex items-center justify-center size-full transition-opacity duration-150 rounded-xs",
    icon: "shrink-0",
    wrapper: "w-full",
    label: "block font-medium text-default cursor-pointer select-none",
    description: "text-muted select-none",
  },
  variants: {
    layout: {
      list: {},
      card: {
        root: [
          "border border-default rounded-lg hover:not-has-disabled:not-has-aria-disabled:not-has-focus-visible:not-has-data-[state=checked]:bg-elevated/50",
          "transition-all duration-150",
        ],
      },
    },
    side: {
      start: {
        root: "flex-row",
        wrapper: "ms-2",
      },
      end: {
        root: "flex-row-reverse",
        wrapper: "me-2",
      },
    },
    hasIndicator: {
      false: {
        base: "sr-only",
        wrapper: "flex flex-col items-center gap-1 text-center cursor-pointer",
      },
    },
    size: {
      xs: {
        base: "size-3",
        icon: "size-2.5",
        container: "h-4",
        wrapper: "text-xs",
      },
      sm: {
        base: "size-3.5",
        icon: "size-3",
        container: "h-4",
        wrapper: "text-xs",
      },
      md: {
        base: "size-4",
        icon: "size-3.5",
        container: "h-5",
        wrapper: "text-sm",
      },
      lg: {
        base: "size-4.5",
        icon: "size-4",
        container: "h-5",
        wrapper: "text-sm",
      },
      xl: {
        base: "size-5",
        icon: "size-4.5",
        container: "h-6",
        wrapper: "text-base",
      },
    },
    highlight: {
      true: {
        base: "ring-2 ring-inset ring-[var(--rl-ring)] outline-2 outline-solid outline-[var(--rl-ring)] outline-offset-2",
      },
    },
    checked: {
      true: {
        base: "ring-1 ring-inset ring-[var(--rl-ring)] bg-[var(--rl-bg)]",
        indicator: "bg-[var(--rl-bg)] text-inverted opacity-100",
        icon: "text-inverted",
      },
      false: {
        indicator: "hidden opacity-0",
      },
    },
  },
  compoundVariants: [
    {
      hasIndicator: false,
      class: {
        container: "h-auto",
      },
    },
    {
      layout: "card",
      highlight: false,
      class: {
        root: "hover:not-has-disabled:not-has-aria-disabled:not-has-focus-visible:not-has-data-[state=checked]:border-accented",
      },
    },
    {
      size: "xs",
      hasIndicator: false,
      class: {
        icon: "size-3",
      },
    },
    {
      size: "sm",
      hasIndicator: false,
      class: {
        icon: "size-3.5",
      },
    },
    {
      size: "md",
      hasIndicator: false,
      class: {
        icon: "size-4",
      },
    },
    {
      size: "lg",
      hasIndicator: false,
      class: {
        icon: "size-4.5",
      },
    },
    {
      size: "xl",
      hasIndicator: false,
      class: {
        icon: "size-5",
      },
    },
    {
      size: "xs",
      layout: "card",
      class: {
        root: "p-2.5",
      },
    },
    {
      size: "sm",
      layout: "card",
      class: {
        root: "p-3",
      },
    },
    {
      size: "md",
      layout: "card",
      class: {
        root: "p-3.5",
      },
    },
    {
      size: "lg",
      layout: "card",
      class: {
        root: "p-4",
      },
    },
    {
      size: "xl",
      layout: "card",
      class: {
        root: "p-4.5",
      },
    },
    {
      layout: "card",
      class: {
        root: "outline-[var(--rl-ring)]/25 has-focus-visible:outline-3 not-has-disabled:has-focus-visible:border-[var(--rl-border)] has-focus-visible:z-[1]",
      },
    },
    {
      layout: "card",
      checked: true,
      class: {
        root: "border-[var(--rl-border)]/50 bg-[var(--rl-bg)]/10",
      },
    },
    {
      layout: "card",
      highlight: true,
      class: {
        root: "ring-2 ring-[var(--rl-ring)] border-[var(--rl-border)] outline-2 outline-solid outline-[var(--rl-ring)] outline-offset-2",
      },
    },
    {
      layout: "list",
      hasIndicator: true,
      class: {
        base: "outline-[var(--rl-ring)]/25 focus-visible:outline-solid focus-visible:outline-3 focus-visible:ring-[var(--rl-ring)]",
      },
    },
    {
      layout: "list",
      hasIndicator: false,
      class: {
        root: "outline-[var(--rl-ring)]/25 has-focus-visible:outline-3 not-has-disabled:has-focus-visible:border-[var(--rl-border)] has-focus-visible:z-[1]",
      },
    },
    {
      hasIndicator: false,
      checked: true,
      class: {
        icon: "text-[var(--rl-text)]",
      },
    },
    {
      hasIndicator: false,
      highlight: true,
      class: {
        root: "not-has-disabled:not-has-aria-disabled:border-[var(--rl-border)] not-has-disabled:not-has-aria-disabled:has-data-[state=checked]:border-[var(--rl-border)]",
      },
    },
    {
      color: "neutral",
      checked: true,
      class: {
        base: "ring-1 ring-inset ring-inverted bg-inverted",
        indicator: "bg-inverted text-inverted",
        icon: "text-inverted",
      },
    },
    {
      color: "neutral",
      layout: "card",
      checked: true,
      class: {
        root: "border-inverted/50 bg-elevated",
      },
    },
    {
      color: "neutral",
      hasIndicator: false,
      checked: true,
      class: {
        icon: "text-highlighted",
      },
    },
    {
      color: "neutral",
      hasIndicator: false,
      highlight: true,
      class: {
        root: "not-has-disabled:not-has-aria-disabled:border-inverted not-has-disabled:not-has-aria-disabled:has-data-[state=checked]:border-inverted",
      },
    },
    {
      color: "neutral",
      highlight: true,
      class: {
        base: "ring-2 ring-inset ring-inverted outline-2 outline-solid outline-inverted outline-offset-2",
      },
    },
    {
      color: "neutral",
      layout: "card",
      highlight: true,
      class: {
        root: "ring-2 ring-inverted border-inverted outline-2 outline-solid outline-inverted outline-offset-2",
      },
    },
  ],
  defaultVariants: {
    highlight: false,
    size: "md",
    color: "primary",
    layout: "list",
    side: "start",
    hasIndicator: true,
    checked: false,
  },
});
