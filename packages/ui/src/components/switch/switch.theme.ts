import { defineTheme } from "../../resolver"

export const switchTheme = defineTheme("switch", {
  slots: ["root", "input", "track", "thumb", "label"],
  base: {
    root: "inline-flex items-center gap-2 cursor-pointer select-none",
    input: "absolute opacity-0 size-0 pointer-events-none peer",
    track: [
      "inline-flex h-5 w-9 shrink-0 items-center rounded-full border-2 border-transparent bg-muted transition-all focus-within:ring-2 focus-within:ring-[var(--rl-ring)]/50 focus-within:ring-offset-2",
      "peer-checked:bg-[var(--rl-bg)]",
      "peer-disabled:cursor-not-allowed peer-disabled:opacity-50"
    ],
    thumb:
      "pointer-events-none block size-4 rounded-full bg-default shadow-lg ring-0 transition-transform duration-200 translate-x-0",
    label: "text-sm text-highlighted leading-none"
  },
  variants: {
    color: "auto",
    size: {
      sm: { track: "h-4 w-7", thumb: "size-3", label: "text-xs" },
      md: { track: "h-5 w-9", thumb: "size-4", label: "text-sm" },
      lg: { track: "h-6 w-11", thumb: "size-5", label: "text-base" }
    },
    checked: {
      true: { thumb: "translate-x-full" },
      false: { thumb: "translate-x-0" }
    }
  },
  compoundVariants: [
    {
      size: "sm",
      checked: true,
      classNames: { thumb: "translate-x-3" }
    },
    {
      size: "md",
      checked: true,
      classNames: { thumb: "translate-x-4" }
    },
    {
      size: "lg",
      checked: true,
      classNames: { thumb: "translate-x-5" }
    }
  ],
  defaultVariants: {
    color: "primary",
    size: "md",
    checked: false
  }
})
