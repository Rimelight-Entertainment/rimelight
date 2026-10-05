import { defineTheme } from "../../resolver";

export const RLKbdTheme = defineTheme("kbd", {
  slots: ["root"],
  base: {
    root: "inline-flex items-center justify-center px-1 rounded-sm font-medium font-sans uppercase",
  },
  variants: {
    color: "auto",
    variant: {
      solid: { root: "bg-[var(--rl-bg)] text-white" },
      outline: { root: "ring ring-inset ring-[var(--rl-border)]/50 text-[var(--rl-text)]" },
      soft: { root: "text-[var(--rl-text)] bg-[var(--rl-bg)]/10" },
      subtle: {
        root: "text-[var(--rl-text)] ring ring-inset ring-[var(--rl-border)]/25 bg-[var(--rl-bg)]/10",
      },
    },
    size: {
      sm: { root: "h-4 min-w-[16px] text-[10px]" },
      md: { root: "h-5 min-w-[20px] text-[11px]" },
      lg: { root: "h-6 min-w-[24px] text-[12px]" },
    },
  },
  compoundVariants: [
    {
      color: "neutral",
      variant: "solid",
      classNames: { root: "text-inverted bg-inverted" },
    },
    {
      color: "neutral",
      variant: "outline",
      classNames: { root: "ring ring-inset ring-accented text-default bg-default" },
    },
    {
      color: "neutral",
      variant: "soft",
      classNames: { root: "text-default bg-elevated" },
    },
    {
      color: "neutral",
      variant: "subtle",
      classNames: { root: "ring ring-inset ring-accented text-default bg-elevated" },
    },
  ],
  defaultVariants: {
    variant: "outline",
    color: "neutral",
    size: "md",
  },
});
