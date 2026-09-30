import { defineTheme } from "../../resolver";

export const calloutTheme = defineTheme("callout", {
  slots: ["root", "body", "icon", "title", "content", "avatar", "avatarSize", "actions", "close"],
  base: {
    root: "relative overflow-hidden w-full rounded-lg p-4 flex gap-2.5 items-start",
    body: "flex flex-col gap-2.5 flex-1 min-w-0",
    icon: "shrink-0 size-6 inline-flex items-center justify-center",
    title: "text-sm font-bold",
    content: "text-sm opacity-90 leading-relaxed [&>:first-child]:mt-0 [&>:last-child]:mb-0",
    avatar: "shrink-0",
    avatarSize: "2xl",
    actions: "flex flex-wrap gap-1.5",
    close: "p-0 ml-auto",
  },
  variants: {
    variant: {
      solid: { root: "bg-[var(--rl-bg)] text-white" },
      outline: { root: "text-[var(--rl-text)] ring ring-inset ring-[var(--rl-border)]/25" },
      soft: { root: "bg-[var(--rl-bg)]/10 text-[var(--rl-text)]" },
      subtle: {
        root: "bg-[var(--rl-bg)]/10 text-[var(--rl-text)] ring ring-inset ring-[var(--rl-border)]/25",
      },
    },
    color: "auto",
  },
  compoundVariants: [
    {
      color: "neutral",
      variant: "solid",
      classNames: {
        root: "text-inverted bg-inverted",
      },
    },
    {
      color: "neutral",
      variant: "outline",
      classNames: {
        root: "text-highlighted bg-default ring ring-inset ring-default",
      },
    },
    {
      color: "neutral",
      variant: "soft",
      classNames: {
        root: "text-highlighted bg-elevated/50",
      },
    },
    {
      color: "neutral",
      variant: "subtle",
      classNames: {
        root: "text-highlighted bg-elevated/50 ring ring-inset ring-accented",
      },
    },
  ],
  defaultVariants: {
    color: "primary",
    variant: "solid",
  },
});
