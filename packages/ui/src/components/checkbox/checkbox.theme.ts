import { defineTheme } from "../../resolver";

export const checkboxTheme = defineTheme("checkbox", {
  slots: ["root", "input", "box", "indicator", "label"],
  base: {
    root: "relative inline-flex items-center gap-2 cursor-pointer select-none",
    input: "sr-only peer",
    box: [
      "size-4 shrink-0 rounded border border-default bg-default transition-all focus-within:ring-2 focus-within:ring-[var(--rl-ring)]/50 focus-within:ring-offset-2",
      "peer-checked:bg-[var(--rl-bg)] peer-checked:border-[var(--rl-border)] peer-checked:[&_[data-slot=indicator]]:scale-100",
      "peer-disabled:cursor-not-allowed peer-disabled:opacity-50"
    ],
    indicator:
      "flex items-center justify-center text-white scale-0 transition-transform duration-150",
    label: "text-sm text-highlighted leading-none"
  },
  variants: {
    color: "auto",
    size: {
      sm: { box: "size-3.5", label: "text-xs" },
      md: { box: "size-4", label: "text-sm" },
      lg: { box: "size-4.5", label: "text-base" }
    },
    checked: {
      true: { indicator: "scale-100" },
      false: { indicator: "scale-0" }
    }
  },
  defaultVariants: {
    color: "primary",
    size: "md",
    checked: false
  }
});
