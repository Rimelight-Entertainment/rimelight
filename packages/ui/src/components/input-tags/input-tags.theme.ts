import { defineTheme } from "../../resolver";

export const RLInputTagsTheme = defineTheme("input-tags", {
  slots: ["root", "tag", "tagLabel", "more", "input"],
  base: {
    root: "flex flex-wrap items-center gap-1.5",
    tag: [
      "inline-flex items-center gap-1 px-2 py-0.5",
      "rounded-full text-xs font-medium",
      "bg-[var(--rl-bg)]/10 text-[var(--rl-text)]",
      "ring-1 ring-[var(--rl-border)]/30",
      "whitespace-nowrap select-none",
    ],
    tagLabel: "leading-none",
    more: [
      "inline-flex items-center justify-center px-2 py-0.5",
      "rounded-full text-xs font-semibold",
      "bg-muted text-muted",
      "ring-1 ring-accented/40",
      "whitespace-nowrap select-none cursor-default",
    ],
    input: ["flex-1 min-w-[6rem] bg-transparent text-sm outline-none", "placeholder:text-muted"],
  },
  variants: {
    color: "auto",
  },
  compoundVariants: [
    {
      color: "neutral",
      class: {
        tag: "bg-elevated text-highlighted ring-accented/60",
      },
    },
  ],
  defaultVariants: {
    color: "primary",
  },
});
