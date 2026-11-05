import { defineTheme } from "../../resolver";

export const RLCalloutTheme = defineTheme("callout", {
  slots: ["root", "wrapper", "title", "description", "icon", "avatar", "actions", "close"],
  base: {
    root: "relative overflow-hidden w-full rounded-lg p-4 flex gap-2.5",
    wrapper: "min-w-0 flex-1 flex flex-col",
    title: "text-sm font-medium",
    description: "text-sm opacity-90 leading-relaxed",
    icon: "shrink-0 size-5 inline-flex items-center justify-center pointer-events-none",
    avatar: "shrink-0",
    actions: "flex flex-wrap gap-1.5 shrink-0",
    close: "p-0",
  },
  variants: {
    color: "auto",
    variant: {
      solid: {
        root: "bg-[var(--rl-bg)] text-inverted",
      },
      outline: {
        root: "text-[var(--rl-text)] ring ring-inset ring-[var(--rl-border)]/25",
      },
      soft: {
        root: "bg-[var(--rl-bg)]/10 text-[var(--rl-text)]",
      },
      subtle: {
        root: "bg-[var(--rl-bg)]/10 text-[var(--rl-text)] ring ring-inset ring-[var(--rl-border)]/25",
      },
    },
    orientation: {
      horizontal: {
        root: "items-center",
        actions: "items-center",
      },
      vertical: {
        root: "items-start",
        actions: "items-start mt-2.5",
      },
    },
    title: {
      true: {
        description: "mt-1",
      },
      false: {},
    },
  },
  compoundVariants: [
    {
      color: "neutral",
      variant: "solid",
      class: {
        root: "text-default bg-inverted",
      },
    },
    {
      color: "neutral",
      variant: "outline",
      class: {
        root: "text-highlighted bg-default ring ring-inset ring-default",
      },
    },
    {
      color: "neutral",
      variant: "soft",
      class: {
        root: "text-highlighted bg-elevated/50",
      },
    },
    {
      color: "neutral",
      variant: "subtle",
      class: {
        root: "text-highlighted bg-elevated/50 ring ring-inset ring-accented",
      },
    },
  ],
  defaultVariants: {
    color: "primary",
    variant: "solid",
    orientation: "vertical",
  },
});
