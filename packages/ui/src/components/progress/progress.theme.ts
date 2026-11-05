import { defineTheme } from "../../resolver";

export const RLProgressTheme = defineTheme("progress", {
  slots: ["root", "indicator"],
  base: {
    root: "relative w-full overflow-hidden rounded-full bg-muted shadow-inner",
    indicator: "h-full rounded-full transition-all duration-300 ease-in-out bg-[var(--rl-bg)]",
  },
  variants: {
    color: "auto",
    size: {
      xs: { root: "h-1" },
      sm: { root: "h-1.5" },
      md: { root: "h-3" },
      lg: { root: "h-5" },
      xl: { root: "h-7" },
    },
  },
  defaultVariants: {
    color: "primary",
    size: "md",
  },
});
